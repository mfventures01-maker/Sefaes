import { studentService } from "../services/studentService";
import { onboardingService } from "../services/onboardingService";
import { classService } from "../services/classService";
import { StudentCommandTypes } from "../commands/eduCommands/studentCommands";
import { subjectService } from "../services/subjectService";
import { examEventEngine } from "../engine/examEventEngine";
import { enterTransition, exitTransition } from "../engine/mutationPolicy";
import { queryTable } from "../lib/rpcClient";

export class StudentExecutor {
    public async execute(type: string, payload: any, identity: any): Promise<any> {
        console.info(`[StudentExecutor.execute] Executing student domain command ${type} for actor: ${identity.userId}`);

        switch (type) {
            case StudentCommandTypes.STUDENT_ENROLL: {
                enterTransition();
                try {
                    if (payload.students && Array.isArray(payload.students)) {
                        const result = await onboardingService.bulkEnrollStudents(payload.students, payload.schoolId);
                        return { success: true, data: result };
                    } else {
                        const result = await studentService.enrollStudent({
                            p_first_name: payload.firstName || payload.first_name,
                            p_last_name: payload.lastName || payload.last_name,
                            p_gender: payload.gender,
                            p_student_number: payload.studentNumber || payload.student_number,
                            p_class_id: payload.classId || payload.class_id,
                            p_school_id: payload.schoolId || payload.school_id,
                            p_date_of_birth: payload.dateOfBirth || payload.date_of_birth
                        });
                        return { success: !!result.student_id, data: result };
                    }
                } finally {
                    exitTransition();
                }
            }

            case StudentCommandTypes.STUDENTS_BULK_CREATE: {
                enterTransition();
                try {
                    const result = await onboardingService.bulkEnrollStudents(payload.students, payload.schoolId);
                    return { success: true, data: result };
                } finally {
                    exitTransition();
                }
            }

            case StudentCommandTypes.STUDENT_DEACTIVATE: {
                return {
                    success: true,
                    data: {
                        studentId: payload.studentId,
                        status: "deactivated",
                        deactivatedBy: identity.userId,
                        deactivatedAt: new Date().toISOString()
                    }
                };
            }

            case StudentCommandTypes.STUDENT_TRANSFER_CLASS: {
                return {
                    success: true,
                    data: {
                        studentId: payload.studentId,
                        fromClassId: payload.fromClassId,
                        toClassId: payload.toClassId,
                        transferredBy: identity.userId,
                        transferredAt: new Date().toISOString()
                    }
                };
            }

            case StudentCommandTypes.STUDENT_READ: {
                const result = await queryTable('students', (builder) =>
                    builder
                        .select('id, first_name, last_name, gender, student_number, class_id, school_id')
                        .eq('school_id', payload.schoolId)
                );
                return { success: true, data: result };
            }

            // ── Class/Academic CRUD ──────────────────────────────────────────
            case StudentCommandTypes.CLASSES_READ: {
                const result = await classService.getClasses(payload.schoolId);
                return { success: true, data: result };
            }

            case StudentCommandTypes.CLASSES_CREATE: {
                const result = await examEventEngine.transition('CREATE_CLASS', {
                    role: identity.role || 'admin',
                    data: { name: payload.name, schoolId: payload.schoolId }
                });
                return { success: true, data: result };
            }

            case StudentCommandTypes.CLASSES_DELETE: {
                const result = await examEventEngine.transition('DELETE_CLASS', {
                    role: identity.role || 'admin',
                    id: payload.id
                });
                return { success: true, data: result };
            }

            // ── Subjects Catalog / Assignments ──────────────────────────────
            case StudentCommandTypes.SUBJECTS_READ: {
                const result = await subjectService.getSubjectCatalog();
                return { success: true, data: result };
            }

            case StudentCommandTypes.SUBJECTS_CREATE: {
                const result = await examEventEngine.transition('CREATE_SUBJECT', {
                    role: identity.role || 'admin',
                    name: payload.name
                });
                return { success: true, data: result };
            }

            case StudentCommandTypes.CLASS_SUBJECTS_READ: {
                const result = await subjectService.getClassSubjects(payload.schoolId);
                return { success: true, data: result };
            }

            case StudentCommandTypes.CLASS_SUBJECTS_CREATE: {
                const result = await examEventEngine.transition('ASSIGN_SUBJECT_TO_CLASS', {
                    role: identity.role || 'admin',
                    classId: payload.classId,
                    subjectId: payload.subjectId,
                    schoolId: payload.schoolId
                });
                return { success: true, data: result };
            }

            case StudentCommandTypes.CLASS_SUBJECTS_DELETE: {
                const result = await examEventEngine.transition('DELETE_SUBJECT_ASSIGNMENT', {
                    role: identity.role || 'admin',
                    id: payload.id
                });
                return { success: true, data: result };
            }

            default:
                throw new Error(`UNKNOWN_STUDENT_COMMAND: ${type}`);
        }
    }
}
