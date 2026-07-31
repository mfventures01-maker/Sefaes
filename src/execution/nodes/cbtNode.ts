import { CBTExecutor } from "../cbtExecutor";

export class CBTNode {
    private executor = new CBTExecutor();

    public async execute(type: string, payload: any, identity: any): Promise<any> {
        return this.executor.execute(type, payload, identity);
    }
}
