import { ExecutionNodeRouter } from "./ExecutionNodeRouter";

const router = new ExecutionNodeRouter();

export interface EduExecutionResult {
    success: boolean;
    data?: any;
    error?: string;
}

export async function executeEduCommand(command: any, identity: any): Promise<EduExecutionResult> {
    try {
        const data = await router.execute(command.type, command.payload, identity);
        
        // Normalize returned object structures
        if (data && typeof data === 'object' && 'success' in data) {
            return {
                success: data.success,
                data: data.data,
                error: data.error?.message || data.error
            };
        }
        
        return {
            success: true,
            data
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || "EDU_EXECUTION_FAILED"
        };
    }
}
