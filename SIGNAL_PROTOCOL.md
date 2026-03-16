# SEFAES DETERMINISTIC SIGNAL PROTOCOL
## Complete Frontend–Backend Language Specification

> **System**: SEFAES  
> **Architecture**: Deterministic  
> **Truth Source**: Database (PostgreSQL)  
> **Communication**: RPC Signal Language  
> **State Model**: Backend Reflection  

---

## CORE SYSTEM LAW

**THE DATABASE IS THE SOLE TRUTH BEARER.**

Frontend state is only a temporary reflection of database state.

Frontend must:
- ❌ NEVER create business truth
- ❌ NEVER fabricate workflow logic
- ❌ NEVER invent payload structures
- ✅ ALWAYS use canonical RPC sentences
- ✅ ALWAYS reflect backend state exactly

---

## SIGNAL PIPELINE

All communication follows this deterministic pipeline:

```
UI Action
    ↓
Signal Command
    ↓
Service Translation
    ↓
RPC Sentence
    ↓
Database Mutation
    ↓
Trigger / Worker Process
    ↓
Database State Update
    ↓
UI State Refresh
```

---

## SIGNAL CLASSES

| Class | Purpose | Direction |
|-------|---------|-----------|
| **COMMAND** | Request mutation in backend state | UI → Backend |
| **QUERY** | Request truth from database | UI ← Backend |
| **EVENT** | Database-triggered side effects | Backend only |
| **WORKER** | Independent processing | Backend only |

---

## COMMAND SIGNALS

### SIGNAL: `CREATE_INSTITUTION`

| Property | Value |
|----------|-------|
| Service | `onboardingService.createInstitutionAccount()` |
| RPC | `create_institution_account` |
| Tables | `institutions`, `profiles` |

**Payload**
```typescript
{
    institution_name: string
    institution_type: 'secondary_school' | 'university' | 'corporate'
    country: string
    state: string
    admin_email: string
}
```

**Response**: `{ institution_id: uuid, admin_user_id: uuid }`

---

### SIGNAL: `CREATE_SCHOOL`

| Property | Value |
|----------|-------|
| Service | `onboardingService.createSchool()` |
| RPC | `create_school_with_classes` |
| Tables | `schools`, `classes` (via trigger) |

**Payload**
```typescript
{
    p_school_name: string
    p_school_type: 'Secondary' | 'Primary'
    p_email: string
    p_phone: string
    p_address: string
    p_logo_url: string
    p_principal_name: string
    p_vice_principal_name: string
    p_institution_id: uuid
}
```

**Response**: `{ id: uuid, school_name: string }`

---

### SIGNAL: `CREATE_ANSWER_SCRIPT` (UPLOAD_SCRIPT)

| Property | Value |
|----------|-------|
| Service | `gradingService.createAnswerScript()` |
| RPC | `create_answer_script` |
| Tables | `answer_scripts` → trigger → `grading_jobs` |

**Payload**
```typescript
{
    student_id: uuid
    exam_id: uuid
    teacher_id: uuid
    school_id: uuid
    ocr_text: string
    file_url?: string
}
```

**Response**: `{ script_id: uuid, status: 'pending' }`

**Side Effect**: Database trigger `queue_grading_job` automatically inserts into `grading_jobs`.

---

### SIGNAL: `CREATE_EXAM`

| Property | Value |
|----------|-------|
| Service | `gradingService.createExam()` |
| Method | Direct insert into `exams` |

---

## QUERY SIGNALS

### SIGNAL: `RESOLVE_TEACHER_IDENTITY`

| Property | Value |
|----------|-------|
| Service | `identityService.resolveTeacher()` |
| RPC | `resolve_teacher_identity` |
| Tables | `teachers` (lookup via `auth.uid()`) |

**Response**: `{ teacher_id, school_id, teacher_name, teacher_email }`

---

### SIGNAL: `LOAD_EXAMS`

| Property | Value |
|----------|-------|
| Service | `gradingService.loadExams(school_id)` |
| Method | `SELECT exams WHERE school_id = ?` |

**Fields**: `id, exam_title, subject_id, class_id, exam_date, marking_scheme`

---

### SIGNAL: `LOAD_STUDENTS`

| Property | Value |
|----------|-------|
| Service | `gradingService.loadStudents(school_id)` |
| Method | `SELECT students JOIN classes WHERE classes.school_id = ?` |

**Fields**: `id, first_name, last_name, student_number, class_id`

---

### SIGNAL: `LOAD_GRADING_STATUS`

| Property | Value |
|----------|-------|
| Service | `gradingService.loadGradingStatus()` |
| Method | Query `answer_scripts` + `grading_jobs` |

**Response**: `{ pendingScripts: [...], activeJobs: [...] }`

**Status Values**: `pending`, `processing`, `completed`, `failed`

---

### SIGNAL: `LOAD_GRADING_RESULTS`

| Property | Value |
|----------|-------|
| Service | `gradingService.loadGradingResults(scriptIds)` |
| Method | `SELECT grading_results JOIN answer_scripts JOIN students` |

**Fields**: `score, ai_feedback, confidence, student name, exam_id`

---

### SIGNAL: `LOAD_PIPELINE_HEALTH`

| Property | Value |
|----------|-------|
| Service | `gradingService.loadPipelineHealth()` |
| Method | `SELECT pipeline_health` (view) |

---

## EVENT SIGNALS

Event signals are database-triggered actions. **Frontend must never initiate them.**

### EVENT: `QUEUE_GRADING_JOB`

| Property | Value |
|----------|-------|
| Trigger | `AFTER INSERT ON answer_scripts` |
| Effect | `INSERT INTO grading_jobs (script_id, status='pending')` |

### EVENT: `WORKER_CLAIM_JOB`

| Property | Value |
|----------|-------|
| Actor | Edge Worker |
| RPC | `claim_grading_jobs(batch_size)` |
| Effect | `UPDATE grading_jobs SET status='processing'` |

### EVENT: `FINALIZE_GRADING`

| Property | Value |
|----------|-------|
| Actor | Edge Worker |
| RPC | `finalize_grading(script_id, score, feedback, confidence)` |
| Effect | `INSERT grading_results` + `UPDATE answer_scripts status` + `UPDATE grading_jobs status` |

---

## WORKER SIGNALS

Workers operate independently of the frontend. Frontend only observes results.

### WORKER: `START_AI_GRADING`

| Property | Value |
|----------|-------|
| Service | `gradingService.startAIGrading()` |
| Method | `supabase.functions.invoke('grade-script')` |

**Worker Pipeline**:
```
claim_grading_jobs(batch_size)
    ↓
AI model grading (Gemini)
    ↓
finalize_grading(script_id, score, feedback, confidence)
```

---

## SERVICE LAYER MAP

| Service | File | Signals |
|---------|------|---------|
| `onboardingService` | `src/services/onboardingService.ts` | CREATE_INSTITUTION, CREATE_SCHOOL, class management, teacher/student CRUD |
| `gradingService` | `src/services/gradingService.ts` | CREATE_EXAM, CREATE_ANSWER_SCRIPT, LOAD_*, START_AI_GRADING, FINALIZE_GRADING |
| `identityService` | `src/services/identityService.ts` | RESOLVE_TEACHER_IDENTITY |
| `institutionService` | `src/services/institutionService.ts` | Institution management |

---

## UI STATE MACHINES

### Onboarding Wizard

```
STATE 1: Institution Creation
    ↓
STATE 2: School Creation  
    ↓
STATE 3: Class Verification
    ↓
STATE 4: Complete
```

### Teacher Workflow

```
SCRIPT_UPLOAD → STATUS_MONITOR → RESULT_DASHBOARD
```

---

## ENFORCEMENT

Two automated sentinels enforce this protocol:

1. **Architecture Guardian** (`npm run architecture-check`)  
   Blocks direct database mutations from UI components.

2. **Schema Drift Sentinel** (`npm run schema-check`)  
   Detects field/table mismatches between frontend and `schema.sql`.

---

## SYSTEM RESONANCE GUARANTEE

If frontend state ≠ database state:

> **Database state overrides UI state. Always.**

---

*Ratified by: Anti-Gravity Architecture Guardian*  
*Date: 2026-03-16*
