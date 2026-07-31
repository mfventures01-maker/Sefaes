import { supabase } from "../lib/supabase";
import { CBTCommandTypes } from "../commands/eduCommands/cbtCommands";
import { CBTSyncGateway } from "../engine/cbtSyncGateway";
import { CBTRecoveryEngine } from "../engine/cbtRecoveryEngine";
import { enterTransition, exitTransition } from "../engine/mutationPolicy";

export class CBTExecutor {
    public async execute(type: string, payload: any, identity: any): Promise<any> {
        console.info(`[CBTExecutor.execute] Executing CBT domain command ${type} for actor: ${identity.userId}`);

        switch (type) {
            case CBTCommandTypes.CBT_START_SESSION: {
                enterTransition();
                try {
                    const examId = payload.examId || payload.exam_id;
                    const studentId = payload.studentId || payload.student_id;

                    // 1. Create CBT Session starting in INITIALIZING state
                    const { data: session, error: sessionError } = await supabase
                        .from('cbt_sessions')
                        .upsert({
                            exam_id: examId,
                            student_id: studentId,
                            state: 'INITIALIZING',
                            current_question: 0,
                            remaining_time: 3600
                        })
                        .select()
                        .single();

                    if (sessionError || !session) {
                        return { success: false, error: { message: sessionError?.message || "Failed to create session" } };
                    }

                    // 2. Transition from INITIALIZING to AUTHENTICATED
                    const { error: transitionError } = await supabase.rpc('transition_cbt_session', {
                        p_session_id: session.id,
                        p_to_state: 'AUTHENTICATED'
                    });

                    if (transitionError) {
                        return { success: false, error: { message: transitionError.message } };
                    }

                    // 3. Create CBT Attempt
                    // FIX-03: Removed nonexistent session_id column.
                    // cbt_attempts schema: id, exam_id, student_id, start_time, end_time, status, score
                    // Fixed status from 'active' → 'in_progress' (schema default)
                    const { data: attempt, error: attemptError } = await supabase
                        .from('cbt_attempts')
                        .upsert({
                            exam_id: examId,
                            student_id: studentId,
                            status: 'in_progress'
                        }, { onConflict: 'exam_id,student_id' })
                        .select()
                        .single();

                    if (attemptError || !attempt) {
                        return { success: false, error: { message: attemptError?.message || "Failed to create attempt" } };
                    }

                    return {
                        success: true,
                        data: {
                            sessionId: session.id,
                            attemptId: attempt.id
                        }
                    };
                } finally {
                    exitTransition();
                }
            }

            case CBTCommandTypes.CBT_LOAD_EXAM: {
                enterTransition();
                try {
                    // Transition: AUTHENTICATED -> LOADING_EXAM
                    const { error: trans1Error } = await supabase.rpc('transition_cbt_session', {
                        p_session_id: payload.sessionId,
                        p_to_state: 'LOADING_EXAM'
                    });

                    if (trans1Error) {
                        return { success: false, error: { message: trans1Error.message } };
                    }

                    // Transition: LOADING_EXAM -> INSTRUCTIONS_VIEW
                    const { error: trans2Error } = await supabase.rpc('transition_cbt_session', {
                        p_session_id: payload.sessionId,
                        p_to_state: 'INSTRUCTIONS_VIEW'
                    });

                    if (trans2Error) {
                        return { success: false, error: { message: trans2Error.message } };
                    }

                    // Fetch exam questions after successful transitions
                    const { data: session, error: sessionFetchError } = await supabase
                        .from('cbt_sessions')
                        .select('exam_id')
                        .eq('id', payload.sessionId)
                        .single();

                    if (sessionFetchError || !session) {
                        return {
                            success: false,
                            error: { message: sessionFetchError?.message || "Session not found" }
                        };
                    }

                    const { data: questions, error: questionsError } = await supabase.rpc('get_cbt_exam_questions', {
                        p_exam_id: session.exam_id
                    });

                    if (questionsError) {
                        return { success: false, error: { message: questionsError.message } };
                    }

                    return {
                        success: true,
                        data: {
                            examId: session.exam_id,
                        sessionId: payload.sessionId,
                            questions,
                            currentState: 'INSTRUCTIONS_VIEW',
                            metadata: {
                                questionCount: questions ? (questions as any[]).length : 0
                            }
                        }
                    };
                } finally {
                    exitTransition();
                }
            }

            case CBTCommandTypes.CBT_BEGIN_EXAM: {
                enterTransition();
                try {
                    const { error } = await supabase.rpc('transition_cbt_session', {
                        p_session_id: payload.sessionId,
                        p_to_state: 'ACTIVE_EXAM'
                    });

                    if (error) {
                        return { success: false, error: { message: error.message } };
                    }
                    return { success: true };
                } finally {
                    exitTransition();
                }
            }

            case CBTCommandTypes.CBT_SUBMIT_ANSWER: {
                enterTransition();
                try {
                    // FIX-02: upsert_cbt_answer does not exist in schema.
                    // Correct RPC is submit_cbt_answer(p_attempt_id, p_question_id, p_option_id).
                    // submit_cbt_answer upserts on (attempt_id, question_id) conflict.
                    const { error } = await supabase.rpc('submit_cbt_answer', {
                        p_attempt_id: payload.attemptId,
                        p_question_id: payload.questionId,
                        p_option_id: payload.optionId
                    });

                    if (error) {
                        return { success: false, error: { message: error.message } };
                    }
                    return { success: true };
                } finally {
                    exitTransition();
            }
}

            case CBTCommandTypes.CBT_NEXT_QUESTION: {
                enterTransition();
                try {
                    const { data: session, error: fetchError } = await supabase
                        .from('cbt_sessions')
                        .select('*')
                        .eq('id', payload.sessionId)
                        .single();

                    if (fetchError || !session) {
                        return { success: false, error: { message: fetchError?.message || "Session not found" } };
                    }

                    const nextQ = (session.current_question || 0) + 1;
                    const { error: updateError } = await supabase
                        .from('cbt_sessions')
                        .update({ current_question: nextQ })
                        .eq('id', payload.sessionId);

                    if (updateError) {
                        return { success: false, error: { message: updateError.message } };
                    }
                    return { success: true };
                } finally {
                    exitTransition();
                }
            }

            case CBTCommandTypes.CBT_PAUSE_SESSION: {
                enterTransition();
                try {
                    const { error } = await supabase.rpc('transition_cbt_session', {
                        p_session_id: payload.sessionId,
                        p_to_state: 'PAUSED'
                    });

                    if (error) {
                        return { success: false, error: { message: error.message } };
                    }
                    return { success: true };
                } finally {
                    exitTransition();
                }
            }

            case CBTCommandTypes.CBT_RESUME_SESSION: {
                enterTransition();
                try {
                    const { error } = await supabase.rpc('transition_cbt_session', {
                        p_session_id: payload.sessionId,
                        p_to_state: 'ACTIVE_EXAM'
                    });

                    if (error) {
                        return { success: false, error: { message: error.message } };
                    }
                    return { success: true };
                } finally {
                    exitTransition();
                }
            }

            case CBTCommandTypes.CBT_SYNC_STATE: {
                enterTransition();
                try {
                    const syncGateway = CBTSyncGateway.getInstance();
                    syncGateway.broadcast({
                        sessionId: payload.sessionId,
                        state: payload.state,
                        currentQuestion: payload.currentQuestion,
                        remainingTime: payload.remainingTime
                    });

                    const { error } = await supabase
                        .from('cbt_sessions')
                        .update({
                            is_synced: true,
                            state: payload.state,
                            current_question: payload.currentQuestion,
                            remaining_time: payload.remainingTime
                        })
                        .eq('id', payload.sessionId);

                    if (error) {
                        return { success: false, error: { message: error.message } };
                    }

                    // Write state snapshot for session recovery
                    await supabase
                        .from('cbt_session_snapshots')
                        .insert({
                            session_id: payload.sessionId,
                            state: payload.state,
                            current_question: payload.currentQuestion,
                            remaining_time: payload.remainingTime
                        });

                    return { success: true };
                } finally {
                    exitTransition();
                }
            }

            case CBTCommandTypes.CBT_RESTORE_SESSION: {
                const recoveryEngine = new CBTRecoveryEngine();
                const res = recoveryEngine.recoverSession(payload.sessionId);
                return { success: res.success };
            }

            case CBTCommandTypes.CBT_AUTO_SUBMIT: {
                enterTransition();
                try {
                    const { error } = await supabase.rpc('submit_cbt_exam', {
                        p_attempt_id: payload.attemptId
                    });

                    if (error) {
                        return { success: false, error: { message: error.message } };
                    }

                    await supabase.rpc('transition_cbt_session', {
                        p_session_id: payload.sessionId,
                        p_to_state: 'SCORED'
                    });

                    return { success: true };
                } finally {
                    exitTransition();
                }
            }

            default:
                throw new Error(`UNKNOWN_CBT_COMMAND: ${type}`);
        }
    }
}

