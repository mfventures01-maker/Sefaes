import { supabase } from "../lib/supabase";
import { ResultCommandTypes } from "../commands/eduCommands/resultCommands";
import { gradingService } from "../services/gradingService";
import { enterTransition, exitTransition } from "../engine/mutationPolicy";

export class ResultExecutor {
    public async execute(type: string, payload: any, identity: any): Promise<any> {
        console.info(`[ResultExecutor.execute] Executing result domain command ${type} for actor: ${identity.userId}`);

        switch (type) {
            case ResultCommandTypes.RESULT_READ: {
                const result = await gradingService.loadAllGradingResults(payload.schoolId);
                return { success: true, data: result };
            }

            case ResultCommandTypes.RESULT_STATUS_READ: {
                const result = await gradingService.loadGradingStatus();
                return { success: true, data: result };
            }

            case ResultCommandTypes.RESULT_START_GRADING: {
                enterTransition();
                try {
                    const result = await gradingService.startAIGrading(payload.examId);
                    return { success: true, data: result };
                } finally {
                    exitTransition();
                }
            }

            case ResultCommandTypes.STORAGE_UPLOAD: {
                const result = await gradingService.uploadScript(payload.fileName, payload.file);
                return { success: true, data: { publicUrl: result } };
            }

            case ResultCommandTypes.ANSWER_SCRIPT_CREATE: {
                enterTransition();
                try {
                    const result = await gradingService.createAnswerScript(payload);
                    return { success: true, data: result };
                } finally {
                    exitTransition();
                }
            }

            case ResultCommandTypes.OCR_PROCESS: {
                return {
                    success: true,
                    data: {
                        text: "Sample OCR output text",
                        confidence: 0.98,
                        processedAt: new Date().toISOString()
                    }
                };
            }

            case ResultCommandTypes.FINALIZE_GRADING: {
                enterTransition();
                try {
                    // Call the RPC for finalization
                    const { error } = await supabase.rpc('finalize_grading', {
                        p_script_id: payload.scriptId || payload.jobId,
                        p_score: payload.score,
                        p_feedback: payload.feedback,
                        p_confidence: payload.confidence || 1.0
                    });

                    if (error) {
                        return { success: false, error: { message: error.message } };
                    }
                    return { success: true };
                } finally {
                    exitTransition();
                }
            }

            case ResultCommandTypes.RETRY_GRADING: {
                enterTransition();
                try {
                    const { error } = await supabase
                        .from('grading_jobs')
                        .update({ status: 'pending', attempts: 0 })
                        .eq('id', payload.jobId);
                    if (error) {
                        return { success: false, error: { message: error.message } };
                    }
                    return { success: true };
                } finally {
                    exitTransition();
                }
            }

            case ResultCommandTypes.GENERATE_INSIGHTS: {
                return {
                    success: true,
                    data: {
                        classAverage: 78.5,
                        highestScore: 98,
                        lowestScore: 45,
                        commonErrors: ["Sign error in question 3", "Misunderstanding of limit notation"]
                    }
                };
            }

            case ResultCommandTypes.RESULT_FAIL_GRADING: {
                enterTransition();
                try {
                    const { error } = await supabase
                        .from('grading_jobs')
                        .update({ status: 'failed', error_message: payload.error })
                        .eq('id', payload.jobId);
                    if (error) {
                        return { success: false, error: { message: error.message } };
                    }
                    return { success: true };
                } finally {
                    exitTransition();
                }
            }

            default:
                throw new Error(`UNKNOWN_RESULT_COMMAND: ${type}`);
        }
    }
}
