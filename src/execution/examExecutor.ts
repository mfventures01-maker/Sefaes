import { supabase } from "../lib/supabase";
import { ExamCommandTypes } from "../commands/eduCommands/examCommands";

export class ExamExecutor {
    public async execute(type: string, payload: any, identity: any): Promise<any> {
        console.info(`[ExamExecutor.execute] Executing exam domain command ${type} for actor: ${identity.userId}`);

        switch (type) {
            case ExamCommandTypes.EXAM_CREATE: {
                // FIX-01: Use create_exam RPC so p_-prefixed keys are correctly
                // mapped to column names. Direct upsert silently ignored all
                // p_school_id, p_class_id etc. causing school_id = NULL.
                const { data, error } = await supabase.rpc('create_exam', payload);
                if (error) {
                    return { success: false, error: { message: error.message } };
                }
                return { success: true, data };
            }

            case ExamCommandTypes.EXAM_READ: {
                const { data, error } = await supabase
                    .from('exams')
                    .select('*');
                if (error) {
                    return { success: false, error: { message: error.message } };
                }
                return { success: true, data };
            }

            case ExamCommandTypes.EXAM_READ_WITH_SCHEMES: {
                const { data, error } = await supabase
                    .from('exams')
                    .select('*');
                if (error) {
                    return { success: false, error: { message: error.message } };
                }
                return { success: true, data };
            }

            case ExamCommandTypes.EXAM_TRANSITION_STATE: {
                const { examId, fromState, toState } = payload;

                if (identity.role === 'student') {
                    return {
                        success: false,
                        error: {
                            message: 'INSUFFICIENT_ROLE: Students cannot transition exam state',
                            code: 'INSUFFICIENT_ROLE'
                        }
                    };
                }

                const allowedTransitions: Record<string, string> = {
                    DRAFT: 'REVIEW',
                    REVIEW: 'APPROVED',
                    APPROVED: 'PUBLISHED',
                    PUBLISHED: 'LOCKED',
                    LOCKED: 'ARCHIVED'
                };

                if (allowedTransitions[fromState] !== toState) {
                    return {
                        success: false,
                        error: {
                            message: `INVALID_STATE_TRANSITION: Cannot transition from ${fromState} to ${toState}`,
                            code: 'INVALID_STATE_TRANSITION'
                        }
                    };
                }

                const { error } = await supabase
                    .from('exams')
                    .update({ status: toState })
                    .eq('id', examId);

                if (error) {
                    return { success: false, error: { message: error.message } };
                }

                return { success: true };
            }

            default:
                throw new Error(`UNKNOWN_EXAM_COMMAND: ${type}`);
        }
    }
}
