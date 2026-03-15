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

-- RLS Enforcement Policy (Enable as needed)
-- ALTER TABLE answer_scripts ENABLE ROW LEVEL SECURITY;

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
