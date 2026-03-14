-- SEFAES Distributed Grading Schema

-- 1. Answer Scripts Table
CREATE TABLE IF NOT EXISTS answer_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    exam_id UUID NOT NULL,
    ocr_text TEXT,
    grading_status TEXT DEFAULT 'pending', -- pending, queued, graded, failed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Grading Job Queue
CREATE TABLE IF NOT EXISTS grading_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID REFERENCES answer_scripts(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    attempts INTEGER DEFAULT 0,
    worker_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    error_message TEXT
);

-- 3. Grading Results Table
CREATE TABLE IF NOT EXISTS grading_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_script_id UUID REFERENCES answer_scripts(id) ON DELETE CASCADE,
    score NUMERIC,
    ai_feedback TEXT,
    confidence NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_grading_jobs_status ON grading_jobs(status);
CREATE INDEX IF NOT EXISTS idx_answer_scripts_status ON answer_scripts(grading_status);

-- 4. AI Usage Governor Table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    action_type TEXT NOT NULL, -- ocr_request, grading_request
    status TEXT DEFAULT 'success', -- success, blocked
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Class Insights Table
CREATE TABLE IF NOT EXISTS class_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    class_average NUMERIC,
    top_student_id UUID REFERENCES students(id),
    weak_topics JSONB,
    remediation_advice TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id)
);
-- 6. Schools Table (Institution Root)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID, -- Links to institution if multi-tenancy exists
    school_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    principal_name TEXT,
    vice_principal_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Subjects Catalog (Master List)
CREATE TABLE IF NOT EXISTS subject_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT -- Science, Arts, etc.
);

-- 9. Class Subjects (Mapping catalog to school classes)
CREATE TABLE IF NOT EXISTS class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subject_catalog(id),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    admission_number TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL, -- Logical link to subject
    exam_title TEXT NOT NULL,
    exam_date DATE DEFAULT CURRENT_DATE,
    marking_scheme JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign Key Updates for existing tables
ALTER TABLE answer_scripts ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id);

-- 13. Atomic Job Claiming Function
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
