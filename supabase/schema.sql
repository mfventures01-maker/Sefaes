-- SEFAES Deterministic Backend Schema
-- Architecture Layer: 1. Identity & Authority

-- 1. Institutions Table (Organization Root)
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_name TEXT NOT NULL,
    institution_type TEXT, -- secondary_school, university, corporate
    country TEXT DEFAULT 'Nigeria',
    state TEXT,
    admin_email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Schools Table (Academic Container)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    school_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    principal_name TEXT,
    vice_principal_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Principals Table (Administrative Identity)
CREATE TABLE IF NOT EXISTS principals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- auth.users.id
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 4. Teachers Table (Academic Identity)
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- auth.users.id
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 5. Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT,
    student_number TEXT UNIQUE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    date_of_birth DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Subjects Catalog
CREATE TABLE IF NOT EXISTS subject_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT
);

-- 8. Class Subjects
CREATE TABLE IF NOT EXISTS class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subject_catalog(id),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subject_catalog(id), -- Logical link to catalog
    exam_title TEXT NOT NULL,
    exam_date DATE DEFAULT CURRENT_DATE,
    marking_scheme JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Answer Scripts Table
CREATE TABLE IF NOT EXISTS answer_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id), -- Assigned teacher
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    ocr_text TEXT,
    grading_status TEXT DEFAULT 'pending', 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Grading Job Queue
CREATE TABLE IF NOT EXISTS grading_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID REFERENCES answer_scripts(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    worker_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    error_message TEXT
);

-- 12. Grading Results Table
CREATE TABLE IF NOT EXISTS grading_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_script_id UUID REFERENCES answer_scripts(id) ON DELETE CASCADE,
    score NUMERIC,
    ai_feedback TEXT,
    confidence NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AI Usage Logs
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id),
    teacher_id UUID REFERENCES teachers(id),
    action_type TEXT NOT NULL,
    status TEXT DEFAULT 'success',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Functions & Triggers

-- Atomic Job Claiming Function
CREATE OR REPLACE FUNCTION claim_grading_jobs(batch_size_limit INT)
RETURNS TABLE (
    id UUID,
    script_id UUID,
    attempts INT,
    ocr_text TEXT,
    exam_id UUID,
    marking_scheme JSONB
) AS $$
BEGIN
    RETURN QUERY
    UPDATE grading_jobs
    SET status = 'processing',
        worker_id = 'edge-worker-atomic',
        processed_at = now()
    WHERE grading_jobs.id IN (
        SELECT g.id
        FROM grading_jobs g
        WHERE g.status = 'pending'
        ORDER BY g.created_at ASC
        LIMIT batch_size_limit
        FOR UPDATE SKIP LOCKED
    )
    RETURNING 
        grading_jobs.id,
        grading_jobs.script_id,
        grading_jobs.attempts,
        (SELECT s.ocr_text FROM answer_scripts s WHERE s.id = grading_jobs.script_id),
        (SELECT s.exam_id FROM answer_scripts s WHERE s.id = grading_jobs.script_id),
        (SELECT e.marking_scheme FROM exams e WHERE e.id = (SELECT s.exam_id FROM answer_scripts s WHERE s.id = grading_jobs.script_id));
END;
$$ LANGUAGE plpgsql;

-- Grading Queue Trigger
CREATE OR REPLACE FUNCTION queue_grading_job()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO grading_jobs (script_id, status)
    VALUES (NEW.id, 'pending');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_queue_grading_job ON answer_scripts;
CREATE TRIGGER trigger_queue_grading_job
AFTER INSERT ON answer_scripts
FOR EACH ROW
EXECUTE FUNCTION queue_grading_job();

-- 13.5 Profiles Table (Shared Identity for RBAC & Handshake Resonance)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT CHECK (role IN ('principal_admin', 'teacher', 'student', 'examiner')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Functions & Triggers (Existing triggers above)

-- 15. Core RPC Functions (Deterministic Onboarding)

CREATE OR REPLACE FUNCTION create_institution_account(
    institution_name TEXT,
    institution_type TEXT,
    country TEXT,
    state TEXT,
    admin_email TEXT
)
RETURNS JSONB AS $$
DECLARE
    new_inst_id UUID;
    admin_uid UUID;
BEGIN
    admin_uid := auth.uid();
    
    INSERT INTO institutions (institution_name, institution_type, country, state, admin_email)
    VALUES (institution_name, institution_type, country, state, admin_email)
    RETURNING id INTO new_inst_id;
    
    INSERT INTO principals (user_id, school_id, name, email)
    VALUES (admin_uid, NULL, institution_name || ' Admin', admin_email);

    -- Also create a central profile record for session handshake
    INSERT INTO profiles (user_id, institution_id, full_name, role)
    VALUES (admin_uid, new_inst_id, institution_name || ' Admin', 'principal_admin');
    
    RETURN jsonb_build_object(
        'institution_id', new_inst_id,
        'admin_user_id', admin_uid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION initialize_secondary_classes(school_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO classes (school_id, name)
    VALUES 
        (school_id, 'JSS 1'),
        (school_id, 'JSS 2'),
        (school_id, 'JSS 3'),
        (school_id, 'SS 1'),
        (school_id, 'SS 2'),
        (school_id, 'SS 3');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION initialize_class_subjects(target_school_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO class_subjects (class_id, subject_id, school_id)
    SELECT c.id, s.id, target_school_id
    FROM classes c, subject_catalog s
    WHERE c.school_id = target_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION enroll_student_subjects(target_student_id UUID)
RETURNS VOID AS $$
BEGIN
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SEFAES BACKEND-FRONTEND ALIGNMENT PROTOCOL FUNCTIONS

CREATE OR REPLACE FUNCTION create_school_with_classes(
    p_school_name TEXT,
    p_school_type TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_address TEXT,
    p_logo_url TEXT,
    p_principal_name TEXT,
    p_vice_principal_name TEXT,
    p_institution_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    new_school_id UUID;
BEGIN
    INSERT INTO schools (
        institution_id, school_name, email, phone, address, 
        logo_url, principal_name, vice_principal_name
    )
    VALUES (
        p_institution_id, p_school_name, p_email, p_phone, p_address,
        p_logo_url, p_principal_name, p_vice_principal_name
    )
    RETURNING id INTO new_school_id;

    -- Auto-initialize classes if it's a secondary school
    IF p_school_type = 'Secondary' THEN
        PERFORM initialize_secondary_classes(new_school_id);
    END IF;

    RETURN jsonb_build_object(
        'id', new_school_id,
        'school_name', p_school_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION resolve_teacher_identity()
RETURNS JSONB AS $$
DECLARE
    teacher_record RECORD;
BEGIN
    SELECT 
        t.id as teacher_id,
        t.school_id,
        t.name as teacher_name,
        t.email as teacher_email
    INTO teacher_record
    FROM teachers t
    WHERE t.user_id = auth.uid();

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    RETURN row_to_json(teacher_record)::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Resilience Layer & Monitoring (Resonance Protocol)

-- Self-Healing: Reset stuck jobs (e.g., processing for > 1 hour)
CREATE OR REPLACE FUNCTION reset_stuck_grading_jobs()
RETURNS INT AS $$
DECLARE
    reset_count INT;
BEGIN
    UPDATE grading_jobs
    SET status = 'pending',
        worker_id = NULL,
        processed_at = NULL,
        attempts = attempts + 1
    WHERE status = 'processing'
    AND processed_at < now() - interval '1 hour';
    
    GET DIAGNOSTICS reset_count = ROW_COUNT;
    RETURN reset_count;
END;
$$ LANGUAGE plpgsql;

-- Monitoring View: Pipeline Health
CREATE OR REPLACE VIEW pipeline_health AS
SELECT 
    (SELECT count(*) FROM answer_scripts) as total_uploads,
    (SELECT count(*) FROM grading_jobs WHERE status = 'pending') as queue_pending,
    (SELECT count(*) FROM grading_jobs WHERE status = 'processing') as queue_processing,
    (SELECT count(*) FROM grading_results) as total_graded,
    (SELECT AVG(confidence) FROM grading_results) as avg_ai_confidence;

-- Monitoring View: Queue Health
CREATE OR REPLACE VIEW queue_health AS
SELECT 
    status,
    count(*) as job_count,
    MAX(created_at) as latest_job,
    MIN(created_at) as oldest_job
FROM grading_jobs
GROUP BY status;
