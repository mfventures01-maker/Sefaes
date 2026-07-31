// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 3 — SERVER COMMAND ROUTER
// Maps validated commands to execution services on the backend.
// ────────────────────────────────────────────────────────────────────────────

import { classService }      from '../services/classService';
import { subjectService }    from '../services/subjectService';
import { gradingService }    from '../services/gradingService';
import { onboardingService } from '../services/onboardingService';
import { identityService }   from '../services/identityService';
import { performOCR }        from '../services/geminiService';
import { examEventEngine }   from '../engine/examEventEngine';
import { enqueueServerCommand } from './serverCommandQueue';
import type { Command } from '../lib/commandTypes';

export class CommandRouter {
    public static async route<TPayload, TResult>(cmd: Command<TPayload>): Promise<TResult> {
        const { type, payload, traceId } = cmd;
        const p = payload as any;

        switch (type) {
            // ── Read ──────────────────────────────────────────────────────────
            case 'classes_READ':
                return await classService.getClasses(p.schoolId) as TResult;

            case 'subjects_READ':
                return await subjectService.getSubjectCatalog() as TResult;

            case 'class_subjects_READ':
                return await onboardingService.getClassSubjects(p.schoolId) as TResult;

            case 'exams_READ':
                return await gradingService.loadExams(p.schoolId) as TResult;

            case 'exams_with_schemes_READ':
                return await gradingService.loadExamsForMarkingSchemes(p.schoolId) as TResult;

            case 'students_READ':
                return await gradingService.loadStudents(p.schoolId) as TResult;

            case 'grading_results_READ':
                return await gradingService.loadAllGradingResults(p.schoolId) as TResult;

            case 'grading_status_READ':
                return await gradingService.loadGradingStatus() as TResult;

            // ── Identity ──────────────────────────────────────────────────────
            case 'identity_RESOLVE_TEACHER':
                return await identityService.resolveTeacher() as TResult;

            // ── Auth Commands ─────────────────────────────────────────────────
            case 'AUTH.RESET_PASSWORD':
                // Handled by authExecutor in the command bus
                // This case should not be reached directly via router
                throw new Error('AUTH.RESET_PASSWORD handled by authExecutor');

            case 'AUTH.UPDATE_PASSWORD':
                // Handled by authExecutor in the command bus
                // This case should not be reached directly via router
                throw new Error('AUTH.UPDATE_PASSWORD handled by authExecutor');

            // ── Mutations ─────────────────────────────────────────────────────
            case 'exams_CREATE':
                return await examEventEngine.transition('CREATE_EXAM', { role: 'teacher', data: p }) as TResult;

            case 'students_BULK_CREATE':
                return await onboardingService.bulkEnrollStudents(p.students, p.schoolId) as TResult;

            case 'subjects_CREATE':
                return await examEventEngine.transition('CREATE_SUBJECT', { role: 'admin', name: p.name }) as TResult;
            case 'class_subjects_CREATE':
                return await examEventEngine.transition('ASSIGN_SUBJECT_TO_CLASS', {
                    role: 'admin', classId: p.classId, subjectId: p.subjectId, schoolId: p.schoolId
                }) as TResult;

            case 'class_subjects_DELETE':
                return await examEventEngine.transition('DELETE_SUBJECT_ASSIGNMENT', { role: 'admin', id: p.id }) as TResult;

            case 'classes_CREATE':
                return await examEventEngine.transition('CREATE_CLASS', {
                    role: 'admin', data: { name: p.name, school_id: p.schoolId }
                }) as TResult;

            case 'classes_DELETE':
                return await examEventEngine.transition('DELETE_CLASS', { role: 'admin', id: p.id }) as TResult;

            // ── Script Pipeline ───────────────────────────────────────────────
            case 'storage_UPLOAD':
                return await gradingService.uploadScript(p.fileName, p.file) as TResult;

            case 'answer_scripts_CREATE':
                return await examEventEngine.transition('CREATE_ANSWER_SCRIPT', { role: 'student', data: p }) as TResult;

            case 'ocr_PROCESS':
                // Instead of enqueueing locally, enqueue to the backend Supabase queue
                return await enqueueServerCommand(cmd, 3) as TResult;

            case 'grading_START':
                // Could also use queue if async. Currently we call service directly
                return await gradingService.startAIGrading(p.examId) as TResult;

            default:
                throw new Error(`COMMAND_NOT_REGISTERED: ${type}`);
        }
    }
}

// ── Register Background Workers ───────────────────────────────────────────────
import { registerServerWorker } from './serverCommandQueue';

registerServerWorker<{ base64: string }>('ocr_PROCESS', async (payload) => {
    return await performOCR(payload.base64);
});

