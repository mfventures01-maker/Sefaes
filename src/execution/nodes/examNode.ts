import { ExamExecutor } from "../examExecutor";

export class ExamNode {
    private executor = new ExamExecutor();

    public async execute(type: string, payload: any, identity: any): Promise<any> {
        return this.executor.execute(type, payload, identity);
    }
}
