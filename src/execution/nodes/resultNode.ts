import { ResultExecutor } from "../resultExecutor";

export class ResultNode {
    private executor = new ResultExecutor();

    public async execute(type: string, payload: any, identity: any): Promise<any> {
        return this.executor.execute(type, payload, identity);
    }
}
