import { StudentExecutor } from "../studentExecutor";

export class StudentNode {
    private executor = new StudentExecutor();

    public async execute(type: string, payload: any, identity: any): Promise<any> {
        return this.executor.execute(type, payload, identity);
    }
}
