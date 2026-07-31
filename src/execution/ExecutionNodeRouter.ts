import { OCRNode } from "./nodes/ocrNode";
import { GradingNode } from "./nodes/gradingNode";
import { InsightsNode } from "./nodes/insightsNode";
import { ExamNode } from "./nodes/examNode";
import { ResultNode } from "./nodes/resultNode";
import { CBTNode } from "./nodes/cbtNode";
import { StudentNode } from "./nodes/studentNode";
import { TeacherReviewNode } from "./nodes/teacherReviewNode";
import {
    StudentCommandTypes,
    ExamCommandTypes,
    ResultCommandTypes,
    CBTCommandTypes
} from "../commands/eduCommands";

export class ExecutionNodeRouter {
    private ocr = new OCRNode();
    private grading = new GradingNode();
    private insights = new InsightsNode();
    private examNode = new ExamNode();
    private resultNode = new ResultNode();
    private cbtNode = new CBTNode();
    private studentNode = new StudentNode();
    private teacherReviewNode = new TeacherReviewNode();

    async execute(type: string, payload: any, identity?: any): Promise<any> {
        // Special sub-node cases for OCR, Grading batch, and Insights
        if (type === 'OCR_COMMAND') {
            return this.ocr.execute(payload);
        }
        if (type === 'GRADING_BATCH_COMMAND') {
            return this.grading.execute(payload);
        }
        if (type === 'INSIGHTS_COMMAND') {
            return this.insights.execute(payload);
        }

        // Standard routing to domain nodes
        if (Object.values(StudentCommandTypes).includes(type as any)) {
            return this.studentNode.execute(type, payload, identity);
        }
        if (Object.values(ExamCommandTypes).includes(type as any)) {
            return this.examNode.execute(type, payload, identity);
        }
        if (Object.values(ResultCommandTypes).includes(type as any)) {
            // Some result commands are routed to OCR, grading, insights node internally if requested
            if (type === ResultCommandTypes.OCR_PROCESS) {
                return this.ocr.execute(payload);
            }
            if (type === ResultCommandTypes.RESULT_START_GRADING) {
                return this.grading.execute(payload);
            }
            if (type === ResultCommandTypes.GENERATE_INSIGHTS) {
                return this.insights.execute(payload);
            }
            return this.resultNode.execute(type, payload, identity);
        }
        if (Object.values(CBTCommandTypes).includes(type as any)) {
            return this.cbtNode.execute(type, payload, identity);
        }

        // Route Teacher Review and Publication commands
        if (type.startsWith('TEACHER_REVIEW.') || type === 'RESULT.PUBLISH' || type === 'RESULT.UNPUBLISH') {
            return this.teacherReviewNode.execute(type, payload, identity);
        }

        throw new Error(`[ExecutionNodeRouter] UNKNOWN_COMMAND: ${type}`);
    }
}
