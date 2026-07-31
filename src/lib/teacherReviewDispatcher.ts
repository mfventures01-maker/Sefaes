import { CommandBus } from './CommandBus';
import { COMMANDS } from './commandRegistry';
import { useStore } from './store';

export const teacherReviewDispatcher = {
    async createReview(payload: { examId: string, scriptId: string, status: string, overrideScore?: number, notes?: string }) {
        const currentUser = useStore.getState().currentUser;
        const schoolId = useStore.getState().schoolId;
        
        return await CommandBus.getInstance().dispatchCommand({
            type: COMMANDS.TEACHER_REVIEW_CREATE,
            payload: {
                ...payload,
                teacherId: currentUser?.id,
                schoolId: schoolId
            }
        });
    },

    async getPendingReviews() {
        const currentUser = useStore.getState().currentUser;
        const schoolId = useStore.getState().schoolId;
        
        if (!currentUser?.id || !schoolId) return { success: false, data: [] };

        return await CommandBus.getInstance().dispatchCommand({
            type: COMMANDS.TEACHER_REVIEW_PENDING,
            payload: {
                teacherId: currentUser.id,
                schoolId: schoolId
            }
        });
    },

    async publishResults(examId: string, notes?: string) {
        const currentUser = useStore.getState().currentUser;
        const schoolId = useStore.getState().schoolId;
        
        return await CommandBus.getInstance().dispatchCommand({
            type: COMMANDS.RESULT_PUBLISH,
            payload: {
                examId,
                schoolId,
                teacherId: currentUser?.id,
                notes
            }
        });
    }
};
