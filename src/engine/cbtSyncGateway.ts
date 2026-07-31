export interface SyncPayload {
    sessionId: string;
    state: string;
    currentQuestion: number;
    remainingTime: number;
}

export class CBTSyncGateway {
    private static instance: CBTSyncGateway;
    private listeners: Record<string, Function[]> = {};

    private constructor() {}

    public static getInstance(): CBTSyncGateway {
        if (!CBTSyncGateway.instance) {
            CBTSyncGateway.instance = new CBTSyncGateway();
        }
        return CBTSyncGateway.instance;
    }

    public once(event: string, cb: Function): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        const wrapper = (...args: any[]) => {
            this.off(event, wrapper);
            cb(...args);
        };
        this.listeners[event].push(wrapper);
    }

    public on(event: string, cb: Function): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(cb);
    }

    public off(event: string, cb: Function): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== cb);
    }

    public broadcast(payload: SyncPayload): void {
        const eventListeners = this.listeners['broadcast'];
        if (eventListeners) {
            const list = [...eventListeners];
            for (const listener of list) {
                listener(payload);
            }
        }
    }
}
