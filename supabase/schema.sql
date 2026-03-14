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
