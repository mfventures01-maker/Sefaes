# SEFAES FRONTEND-BACKEND CANONICAL HANDSHAKE REPORT

## 1. EXECUTIVE SUMMARY
The SEFAES frontend architecture utilizes a mix of service-layer abstractions and direct component-level database interactions. While significant progress has been made to align onboarding with RPC functions, several critical misalignments remain in the legacy dashboard and institution management services.

- **Total Frontend Files**: 50
- **Database Interactions**: 17 Query/Mutation sites
- **RPC Handshakes**: 6 Canonical patterns
- **Critical Misalignments**: 3 Major failures detected
- **System Health Score**: 6.5/10

---

## 2. COMPONENT INVENTORY (Selected Critical)

### `SchoolRegistration.tsx`
- **Purpose**: First-time school setup for users.
- **Handshake**: Calls `create_school_with_classes` RPC.
- **State**: Manages `formData` locally; syncs `schoolId` to Global Store upon success.

### `ScriptUpload.tsx`
- **Purpose**: Student answer script digitization.
- **Handshake**: 
  - Queries `exams` and `students` for context.
  - Uploads to `scripts` storage bucket.
  - Inserts into `answer_scripts` table.
- **Constraint**: Relies on `schoolId` from Global Store.

### `DemoDashboard.tsx` (LEGACY RISK)
- **Purpose**: Demonstration of system capabilities.
- **Handshake**: 
  - **Direct Inserts**: Bypasses service layer to insert into `answer_scripts` and `grading_jobs`.
  - **Missing Data**: Inserts into `answer_scripts` without `school_id` or `teacher_id`.

---

## 3. SERVICE LAYER ANALYSIS

### `onboardingService.ts`
- **Abstraction Level**: High.
- **Canonical Handshakes**:
  - `createInstitutionAccount` → RPC `create_institution_account`
  - `createSchool` → RPC `create_school_with_classes`
  - `initializeSecondaryClasses` → RPC `initialize_secondary_classes`
- **Mismatch**: Still contains direct inserts for `teachers` and `students` which should be transitioned to RPCs for atomicity.

### `institutionService.ts` (CRITICAL FAILURE)
- **Functions**: `createInstitutionAndAttachProfile`
- **Analysis**: 
  - Uses field names `name` and `type` while backend expects `institution_name` and `institution_type`.
  - Attempts to update a `profiles` table that does not exist in the database schema.

---

## 4. COMPLETE HANDSHAKE MAP (CANONICAL)

### 4.1 Table Access Matrix
| Table | Select | Insert | Update | Delete | Primary Component | RLS |
|-------|--------|--------|--------|--------|-------------------|-----|
| `institutions` | ✅ | ✅ | ❌ | ❌ | `InstitutionSelector` | No |
| `schools` | ✅ | ✅ | ✅ | ❌ | `SchoolRegistration` | No |
| `profiles` | ✅ | ❌ | ✅ | ❌ | `AuthGuard` | **FAIL** |
| `answer_scripts` | ✅ | ✅ | ✅ | ❌ | `ScriptUpload` | No |
| `grading_jobs` | ✅ | ✅ | ❌ | ❌ | `GradingQueue` | No |

### 4.2 RPC Function Map
| RPC Function | Called By | Input Pattern | Result Pattern |
|--------------|-----------|---------------|----------------|
| `create_school_with_classes` | `SchoolRegistration` | `{ p_school_name, ... }` | `{ id, school_name }` |
| `resolve_teacher_identity` | `TeacherTerminal` | `none` | `{ teacher_id, school_id }` |
| `claim_grading_jobs` | `Worker` (Edge) | `{ batch_size }` | `Table (id, script_id, ...)` |

---

## 5. CONSTRAINT ANALYSIS

### 5.1 Data Shape Constraints
- **Institutions**: Frontend sends `{ name }`, Backend requires `{ institution_name }`.
- **Answer Scripts**: Frontend sometimes omits `school_id`, violating foreign key constraints if enforced.

### 5.2 Relationship Integrity
- **Orphan Scripts**: `DemoDashboard` creates scripts without linking to a `teacher_id`, making them invisible to the `resolve_teacher_identity` based dashboards.

---

## 6. MISALIGNMENT DETECTION

### 6.1 Field Name Mismatches
| Frontend Field | Backend Field | Source File | Impact |
|----------------|---------------|-------------|--------|
| `name` | `institution_name` | `institutionService.ts` | **SQL Error** |
| `type` | `institution_type` | `institutionService.ts` | **SQL Error** |

### 6.2 Missing Backend Objects
- **Object**: Table `profiles`
- **Impact**: `AuthGuard` and `Signup` flows will fail as they depend on this table for role resolution.

### 6.3 Orphaned/Legacy Logic
- **Function**: `enroll_student_subjects` (RPC) is defined in backend but frontend calls a stub that returns `void`.

---

## 7. RECOMMENDATIONS

### 🚨 SEVERITY: HIGH (Immediate Fix Required)
1. **Schema Sync**: Create the `profiles` table in `schema.sql` with `user_id`, `institution_id`, and `role`.
2. **Field Alignment**: Update `institutionService.ts` to use `institution_name` and `institution_type`.
3. **Identity Spine**: Refactor `AuthGuard` to use `resolve_teacher_identity` or a similar unified identity RPC instead of querying `profiles` directly.

### ⚠️ SEVERITY: MEDIUM (Standardization)
1. **RPC Migration**: Move `DemoDashboard` direct inserts to service-layer RPC calls to ensure data integrity (automatic `grading_jobs` creation).
2. **Global Store Sync**: Ensure `schoolId` is consistently populated from the authenticated session rather than relying on manual state updates.

### ℹ️ SEVERITY: LOW (Cleanup)
1. **Cleanup**: Remove `create_institution_account` if `create_school_with_classes` is intended to be the primary entry point for all organizational units.
