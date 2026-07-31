import { gradingService } from "../../services/gradingService";
import { enterTransition, exitTransition } from "../../engine/mutationPolicy";

export class GradingNode {
    public async execute(payload: any): Promise<any> {
        enterTransition();
        try {
            const result = await gradingService.startAIGrading(payload.examId);
            return result;
        } finally {
            exitTransition();
        }
    }
}
