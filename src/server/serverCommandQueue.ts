import { Command } from '../lib/commandTypes';

const workers: Record<string, (payload: any) => Promise<any>> = {};

export function registerServerWorker<T>(type: string, worker: (payload: T) => Promise<any>) {
    workers[type] = worker;
}

export async function enqueueServerCommand(cmd: Command<any>, priority: number = 3): Promise<any> {
    const worker = workers[cmd.type];
    if (!worker) {
        throw new Error(`No registered worker for command: ${cmd.type}`);
    }
    return await worker(cmd.payload);
}
