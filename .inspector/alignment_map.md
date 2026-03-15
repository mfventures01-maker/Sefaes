# SEFAES BACKEND-FRONTEND ALIGNMENT MAP

## STEP 1: SCHOOL CREATION
### Backend Function
`create_school_with_classes(`
  p_school_name TEXT,
  p_school_type TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_logo_url TEXT,
  p_principal_name TEXT,
  p_vice_principal_name TEXT,
  p_institution_id UUID DEFAULT NULL
`)

### Frontend Must Use:
```typescript
const { data } = await supabase.rpc('create_school_with_classes', {
  p_school_name,
  p_school_type,
  p_email,
  p_phone,
  p_address,
  p_logo_url,
  p_principal_name,
  p_vice_principal_name,
  p_institution_id: null // or actual ID
})
```

## STEP 2: TEACHER IDENTITY
### Backend Function
`resolve_teacher_identity()`

### Frontend Must Use:
```typescript
const { data: teacher } = await supabase.rpc('resolve_teacher_identity')
// Returns: { teacher_id, school_id, teacher_name, teacher_email }
```

## STEP 3: SCRIPT UPLOAD
### Tables Structure
**answer_scripts**
- id (uuid)
- exam_id (uuid)
- student_id (uuid)
- file_url (text)
- ocr_text (text)
- score (numeric)
- ai_feedback (text)
- grading_status (text)
- created_at (timestamp)

**grading_jobs**
- id (uuid)
- script_id (uuid) ← links to answer_scripts.id
- status (text)
- attempts (int)
- worker_id (text)
- created_at (timestamp)
- processed_at (timestamp)
- error_message (text)

### Trigger
`answer_script_grading_trigger` auto-creates grading_jobs

## STEP 4: FAIRNESS GRADING (TO BE ADDED)
**marking_schemes**
- id (uuid)
- exam_id (uuid)
- criterion (text)
- points (int)
- description (text)
- total_points (generated)
- created_at (timestamp)

## DATABASE RELATIONSHIPS
```
institutions → schools → classes → students
                              ↓
                            exams
                              ↓
                      answer_scripts
                              ↓
                      grading_jobs
                              ↓
                      marking_schemes
```

## FORBIDDEN PATTERNS (TO ELIMINATE)
❌ Direct insert into schools without RPC
❌ Direct insert into classes without school_id
❌ Manual teacher auth linking
❌ Bypassing grading_jobs queue
