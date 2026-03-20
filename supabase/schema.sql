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

-- 8.5. Teacher-Subject Assignments
CREATE TABLE IF NOT EXISTS teacher_subject_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    class_subject_id UUID REFERENCES class_subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(teacher_id, class_subject_id)
);

-- 8.7. Student-Subject Assignments
CREATE TABLE IF NOT EXISTS student_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_subject_id UUID REFERENCES class_subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, class_subject_id)
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
    file_url TEXT,
    grading_status TEXT DEFAULT 'pending', 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Grading Job Queue
CREATE TABLE IF NOT EXISTS grading_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID REFERENCES answer_scripts(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    worker_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    attempts INT DEFAULT 0,
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

-- 14. AI Usage Logs
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id),
    teacher_id UUID REFERENCES teachers(id),
    action_type TEXT NOT NULL,
    status TEXT DEFAULT 'success',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- CBT MODULE: DETERMINISTIC EXAM ENGINE
-- ──────────────────────────────────────────────

-- 17. CBT Exams (Dynamic Instruction Layer)
CREATE TABLE IF NOT EXISTS cbt_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subject_catalog(id),
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 60,
    passing_score INT DEFAULT 50,
    status TEXT DEFAULT 'draft', -- draft, published, active, completed, archived
    is_randomized BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES teachers(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. CBT Questions
CREATE TABLE IF NOT EXISTS cbt_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES cbt_exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    image_url TEXT,
    marks INT DEFAULT 1,
    order_index INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. CBT Options (Multiple Choice)
CREATE TABLE IF NOT EXISTS cbt_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES cbt_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INT
);

-- 20. CBT Attempts (Student Session Mirror)
CREATE TABLE IF NOT EXISTS cbt_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES cbt_exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    status TEXT DEFAULT 'in_progress', -- in_progress, submitted, timeout
    score INT,
    UNIQUE(exam_id, student_id)
);

-- 21. CBT Answers (Atomic Responses)
CREATE TABLE IF NOT EXISTS cbt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES cbt_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES cbt_questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES cbt_options(id) ON DELETE CASCADE,
    is_correct BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- 22. CBT Results Aggregate
CREATE TABLE IF NOT EXISTS cbt_results_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES cbt_attempts(id) ON DELETE CASCADE,
    total_questions INT,
    correct_answers INT,
    final_percentage NUMERIC,
    rank_in_class INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Functions & Triggers

-- SIGNAL: CREATE_ANSWER_SCRIPT
CREATE OR REPLACE FUNCTION create_answer_script(
    p_student_id UUID,
    p_exam_id UUID,
    p_teacher_id UUID,
    p_school_id UUID,
    p_ocr_text TEXT,
    p_file_url TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    new_script_id UUID;
BEGIN
    INSERT INTO answer_scripts (
        student_id, exam_id, teacher_id, school_id, ocr_text, file_url, grading_status
    )
    VALUES (
        p_student_id, p_exam_id, p_teacher_id, p_school_id, p_ocr_text, p_file_url, 'pending'
    )
    RETURNING id INTO new_script_id;

    RETURN jsonb_build_object(
        'script_id', new_script_id,
        'status', 'pending'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: FINALIZE_GRADING
CREATE OR REPLACE FUNCTION finalize_grading(
    p_script_id UUID,
    p_score NUMERIC,
    p_feedback TEXT,
    p_confidence NUMERIC
)
RETURNS VOID AS $$
BEGIN
    -- 1. Insert into results
    INSERT INTO grading_results (answer_script_id, score, ai_feedback, confidence)
    VALUES (p_script_id, p_score, p_feedback, p_confidence);

    -- 2. Update script status
    UPDATE answer_scripts 
    SET grading_status = 'completed'
    WHERE id = p_script_id;

    -- 3. Mark job as completed
    UPDATE grading_jobs
    SET status = 'completed'
    WHERE script_id = p_script_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic Job Claiming Function

--

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

CREATE OR REPLACE FUNCTION initialize_secondary_classes(p_school_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO classes (school_id, name)
    VALUES 
        (p_school_id, 'JSS 1'),
        (p_school_id, 'JSS 2'),
        (p_school_id, 'JSS 3'),
        (p_school_id, 'SS 1'),
        (p_school_id, 'SS 2'),
        (p_school_id, 'SS 3');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION initialize_class_subjects(p_school_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO class_subjects (class_id, subject_id, school_id)
    SELECT c.id, s.id, p_school_id
    FROM classes c, subject_catalog s
    WHERE c.school_id = p_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: ENROLL_STUDENT_SUBJECTS
-- Enrolls a student into all class_subjects for their assigned class.
CREATE OR REPLACE FUNCTION enroll_student_subjects(p_student_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_class_id UUID;
    v_enrolled_count INT;
BEGIN
    -- 1. Validate Input
    IF p_student_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'p_student_id is required');
    END IF;

    -- 2. Resolve the student's class
    SELECT class_id INTO v_class_id
    FROM students
    WHERE id = p_student_id;

    IF v_class_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Student not found or missing class mapping'
        );
    END IF;

    -- 3. Perform Assignment (Idempotent)
    INSERT INTO student_subjects (student_id, class_subject_id)
    SELECT p_student_id, cs.id
    FROM class_subjects cs
    WHERE cs.class_id = v_class_id
    ON CONFLICT (student_id, class_subject_id) DO NOTHING;

    GET DIAGNOSTICS v_enrolled_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'student_id', p_student_id,
        'assigned_count', v_enrolled_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DETERMINISTIC RPC FUNCTIONS (Eliminating Direct Table Mutations)
-- ============================================================

-- SIGNAL: CREATE_TEACHER
-- We drop to clear any old signature overloads that cause PostgREST cache misses
DROP FUNCTION IF EXISTS create_teacher(TEXT, TEXT, TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS create_teacher(UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_teacher(
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT DEFAULT NULL,
    p_school_id UUID DEFAULT NULL,
    p_class_subject_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    new_teacher_id UUID;
BEGIN
    -- Validation: School ID is mandatory for creation context
    IF p_school_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'p_school_id is required');
    END IF;

    INSERT INTO teachers (school_id, name, email, phone)
    VALUES (p_school_id, p_name, p_email, p_phone)
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO new_teacher_id;

    IF new_teacher_id IS NULL THEN
        -- Attempt to resolve existing teacher if email exists
        SELECT id INTO new_teacher_id FROM teachers WHERE email = p_email;
    END IF;

    -- Optional subject assignment if provided (resonance protocol)
    IF p_class_subject_id IS NOT NULL THEN
        INSERT INTO teacher_subject_assignments (teacher_id, class_subject_id)
        VALUES (new_teacher_id, p_class_subject_id)
        ON CONFLICT (teacher_id, class_subject_id) DO NOTHING;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'teacher_id', new_teacher_id,
        'assignment_created', (p_class_subject_id IS NOT NULL)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: ASSIGN_TEACHER_TO_SUBJECT
CREATE OR REPLACE FUNCTION assign_teacher_to_subject(
    p_teacher_id UUID,
    p_class_subject_id UUID
)
RETURNS JSONB AS $$
DECLARE
    new_assignment_id UUID;
BEGIN
    INSERT INTO teacher_subject_assignments (teacher_id, class_subject_id)
    VALUES (p_teacher_id, p_class_subject_id)
    RETURNING id INTO new_assignment_id;

    RETURN jsonb_build_object(
        'id', new_assignment_id,
        'teacher_id', p_teacher_id,
        'class_subject_id', p_class_subject_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: ENROLL_STUDENT
CREATE OR REPLACE FUNCTION enroll_student(
    p_first_name TEXT,
    p_last_name TEXT,
    p_gender TEXT,
    p_student_number TEXT,
    p_class_id UUID,
    p_school_id UUID,
    p_date_of_birth DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    new_student_id UUID;
BEGIN
    -- Defensive Guard: Reject invalid UUIDs before crash
    IF p_class_id IS NULL OR p_class_id::TEXT = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid or missing class_id'
        );
    END IF;

    IF p_school_id IS NULL OR p_school_id::TEXT = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid or missing school_id'
        );
    END IF;

    INSERT INTO students (first_name, last_name, gender, student_number, class_id, school_id, date_of_birth)
    VALUES (p_first_name, p_last_name, p_gender, p_student_number, p_class_id, p_school_id, p_date_of_birth)
    RETURNING id INTO new_student_id;

    RETURN jsonb_build_object(
        'success', true,
        'student_id', new_student_id,
        'student_number', p_student_number
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DEBUG MIRROR FUNCTION
CREATE OR REPLACE FUNCTION debug_enroll_student(
    p_first_name TEXT,
    p_last_name TEXT,
    p_gender TEXT,
    p_student_number TEXT,
    p_class_id UUID,
    p_school_id UUID,
    p_date_of_birth DATE DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
    RAISE LOG 'DEBUG_ENROLL: first_name=%, last_name=%, gender=%, student_number=%, class_id=%, school_id=%, dob=%', 
        p_first_name, p_last_name, p_gender, p_student_number, p_class_id, p_school_id, p_date_of_birth;

    RETURN jsonb_build_object(
        'success', false,
        'message', 'Debug mirror intercept. Check logs.',
        'payload', jsonb_build_object(
            'p_first_name', p_first_name,
            'p_last_name', p_last_name,
            'p_gender', p_gender,
            'p_student_number', p_student_number,
            'p_class_id', p_class_id,
            'p_school_id', p_school_id,
            'p_date_of_birth', p_date_of_birth
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: BULK_ENROLL_STUDENTS
CREATE OR REPLACE FUNCTION bulk_enroll_students(
    p_students JSONB,
    p_school_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    student_record JSONB;
    enrolled_count INT := 0;
BEGIN
    FOR student_record IN SELECT * FROM jsonb_array_elements(p_students)
    LOOP
        INSERT INTO students (first_name, last_name, gender, student_number, class_id, school_id, date_of_birth)
        VALUES (
            student_record->>'first_name',
            student_record->>'last_name',
            student_record->>'gender',
            student_record->>'student_number',
            (student_record->>'class_id')::UUID,
            p_school_id,
            CASE WHEN student_record->>'date_of_birth' IS NOT NULL AND student_record->>'date_of_birth' <> ''
                 THEN (student_record->>'date_of_birth')::DATE
                 ELSE NULL END
        );
        enrolled_count := enrolled_count + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'enrolled_count', enrolled_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: CREATE_CLASS
CREATE OR REPLACE FUNCTION create_class(
    p_name TEXT,
    p_school_id UUID
)
RETURNS JSONB AS $$
DECLARE
    new_class_id UUID;
    created TIMESTAMPTZ;
BEGIN
    INSERT INTO classes (name, school_id)
    VALUES (p_name, p_school_id)
    RETURNING id, created_at INTO new_class_id, created;

    RETURN jsonb_build_object(
        'id', new_class_id,
        'name', p_name,
        'school_id', p_school_id,
        'created_at', created
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: DELETE_CLASS
CREATE OR REPLACE FUNCTION delete_class(
    p_class_id UUID
)
RETURNS VOID AS $$
BEGIN
    DELETE FROM classes WHERE id = p_class_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: CREATE_SUBJECT_IN_CATALOG
CREATE OR REPLACE FUNCTION create_subject_in_catalog(
    p_name TEXT,
    p_category TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    new_subject_id UUID;
BEGIN
    INSERT INTO subject_catalog (name, category)
    VALUES (p_name, p_category)
    RETURNING id INTO new_subject_id;

    RETURN jsonb_build_object(
        'id', new_subject_id,
        'name', p_name,
        'category', p_category
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: ASSIGN_SUBJECT_TO_CLASS
CREATE OR REPLACE FUNCTION assign_subject_to_class(
    p_class_id UUID,
    p_subject_id UUID,
    p_school_id UUID
)
RETURNS JSONB AS $$
DECLARE
    new_assignment_id UUID;
BEGIN
    INSERT INTO class_subjects (class_id, subject_id, school_id)
    VALUES (p_class_id, p_subject_id, p_school_id)
    RETURNING id INTO new_assignment_id;

    RETURN jsonb_build_object(
        'id', new_assignment_id,
        'class_id', p_class_id,
        'subject_id', p_subject_id,
        'school_id', p_school_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: DELETE_SUBJECT_ASSIGNMENT
CREATE OR REPLACE FUNCTION delete_subject_assignment(
    p_assignment_id UUID
)
RETURNS VOID AS $$
BEGIN
    DELETE FROM class_subjects WHERE id = p_assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: UPDATE_SCHOOL_SETTINGS
CREATE OR REPLACE FUNCTION update_school_settings(
    p_school_id UUID,
    p_school_name TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_principal_name TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE schools SET
        school_name = COALESCE(p_school_name, school_name),
        address = COALESCE(p_address, address),
        principal_name = COALESCE(p_principal_name, principal_name),
        email = COALESCE(p_email, email),
        phone = COALESCE(p_phone, phone)
    WHERE id = p_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: CREATE_EXAM
CREATE OR REPLACE FUNCTION create_exam(
    p_exam_title TEXT,
    p_subject_id UUID,
    p_class_id UUID,
    p_exam_date DATE,
    p_marking_scheme JSONB,
    p_school_id UUID
)
RETURNS JSONB AS $$
DECLARE
    new_exam_id UUID;
BEGIN
    INSERT INTO exams (exam_title, subject_id, class_id, exam_date, marking_scheme, school_id)
    VALUES (p_exam_title, p_subject_id, p_class_id, p_exam_date, p_marking_scheme, p_school_id)
    RETURNING id INTO new_exam_id;

    RETURN jsonb_build_object(
        'id', new_exam_id,
        'exam_title', p_exam_title,
        'school_id', p_school_id
    );
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

-- ──────────────────────────────────────────────
-- CBT RPC MODULE: THE DETERMINISTIC BRAIN
-- ──────────────────────────────────────────────

-- SIGNAL: CREATE_CBT_EXAM
CREATE OR REPLACE FUNCTION create_cbt_exam(
    p_school_id UUID,
    p_class_id UUID,
    p_subject_id UUID,
    p_title TEXT,
    p_duration_minutes INT DEFAULT 60
)
RETURNS JSONB AS $$
DECLARE
    new_exam_id UUID;
BEGIN
    INSERT INTO cbt_exams (school_id, class_id, subject_id, title, duration_minutes, status)
    VALUES (p_school_id, p_class_id, p_subject_id, p_title, p_duration_minutes, 'draft')
    RETURNING id INTO new_exam_id;

    RETURN jsonb_build_object(
        'success', true,
        'exam_id', new_exam_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: ADD_CBT_QUESTION
CREATE OR REPLACE FUNCTION add_cbt_question(
    p_exam_id UUID,
    p_question_text TEXT,
    p_marks INT DEFAULT 1,
    p_options JSONB -- Array of {text: string, is_correct: boolean}
)
RETURNS JSONB AS $$
DECLARE
    new_q_id UUID;
    opt_record RECORD;
BEGIN
    -- 1. Insert Question
    INSERT INTO cbt_questions (exam_id, question_text, marks)
    VALUES (p_exam_id, p_question_text, p_marks)
    RETURNING id INTO new_q_id;

    -- 2. Insert Options
    FOR opt_record IN SELECT * FROM jsonb_to_recordset(p_options) AS x(text TEXT, is_correct BOOLEAN)
    LOOP
        INSERT INTO cbt_options (question_id, option_text, is_correct)
        VALUES (new_q_id, opt_record.text, opt_record.is_correct);
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'question_id', new_q_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: START_CBT_EXAM
CREATE OR REPLACE FUNCTION start_cbt_exam(
    p_exam_id UUID,
    p_student_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_attempt_id UUID;
    v_duration INT;
BEGIN
    -- Check if exam is published
    SELECT duration_minutes INTO v_duration FROM cbt_exams WHERE id = p_exam_id AND status = 'published';
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Exam not published or available');
    END IF;

    -- Check for existing attempt
    SELECT id INTO v_attempt_id FROM cbt_attempts WHERE exam_id = p_exam_id AND student_id = p_student_id;
    
    IF v_attempt_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', true, 'attempt_id', v_attempt_id, 'is_resume', true);
    END IF;

    INSERT INTO cbt_attempts (exam_id, student_id, start_time, status)
    VALUES (p_exam_id, p_student_id, NOW(), 'in_progress')
    RETURNING id INTO v_attempt_id;

    RETURN jsonb_build_object(
        'success', true,
        'attempt_id', v_attempt_id,
        'is_resume', false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: SUBMIT_CBT_ANSWER
CREATE OR REPLACE FUNCTION submit_cbt_answer(
    p_attempt_id UUID,
    p_question_id UUID,
    p_option_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_is_correct BOOLEAN;
BEGIN
    -- 1. Verify correct option
    SELECT is_correct INTO v_is_correct FROM cbt_options WHERE id = p_option_id AND question_id = p_question_id;

    -- 2. Upsert answer
    INSERT INTO cbt_answers (attempt_id, question_id, selected_option_id, is_correct)
    VALUES (p_attempt_id, p_question_id, p_option_id, v_is_correct)
    ON CONFLICT (attempt_id, question_id) 
    DO UPDATE SET selected_option_id = EXCLUDED.selected_option_id, is_correct = EXCLUDED.is_correct;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SIGNAL: SUBMIT_CBT_EXAM
CREATE OR REPLACE FUNCTION submit_cbt_exam(p_attempt_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_earned_marks INT := 0;
BEGIN
    -- 1. Calculate Score
    SELECT COALESCE(SUM(q.marks), 0) INTO v_earned_marks
    FROM cbt_answers a
    JOIN cbt_questions q ON a.question_id = q.id
    WHERE a.attempt_id = p_attempt_id AND a.is_correct = TRUE;

    -- 2. Close Attempt
    UPDATE cbt_attempts SET 
        status = 'submitted', 
        end_time = NOW(),
        score = v_earned_marks
    WHERE id = p_attempt_id;

    RETURN jsonb_build_object(
        'success', true,
        'score', v_earned_marks
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CBT Pipeline Health View
CREATE OR REPLACE VIEW cbt_pipeline_health AS
SELECT 
    (SELECT count(*) FROM cbt_exams) as total_exams,
    (SELECT count(*) FROM cbt_attempts WHERE status = 'in_progress') as active_sessions,
    (SELECT count(*) FROM cbt_attempts WHERE status = 'submitted') as completed_exams;
