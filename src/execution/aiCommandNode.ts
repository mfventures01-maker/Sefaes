import { CommandBus } from "../lib/CommandBus";
import { ResultCommandTypes } from "../commands/eduCommands";

/**
 * AICommandNode v2 — Deterministic Boundary Layer
 * ------------------------------------------------
 * RULES:
 * - No external API calls
 * - No database access
 * - No business logic
 * - Only deterministic routing + validation
 */

type Identity = {
    userId: string;
    role?: string;
};

type CommandMeta = {
    identity: Identity;
    traceId: string;
};

export class AICommandNode {
    private bus = CommandBus.getInstance();

    private generateTraceId(payload: any): string {
        return payload?.traceId ?? `trace_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }

    private assertPayload(payload: any, fields: string[], commandName: string) {
        for (const field of fields) {
            if (!payload || payload[field] === undefined) {
                throw new Error(`[AICommandNode] INVALID_PAYLOAD for ${commandName}: missing ${field}`);
            }
        }
    }

    public async execute(type: string, payload: any, identity: Identity): Promise<any> {
        const traceId = this.generateTraceId(payload);

        const meta: CommandMeta = { identity, traceId };

        console.info(`[AICommandNode] route=${type} trace=${traceId}`);

        switch (type) {

            case ResultCommandTypes.OCR_PROCESS:
                this.assertPayload(payload, ["base64"], "OCR_PROCESS");

                return this.bus.dispatch({
                    type: "OCR_COMMAND",
                    payload,
                    meta
                });

            case ResultCommandTypes.RESULT_START_GRADING:
                this.assertPayload(payload, ["examId"], "RESULT_START_GRADING");

                return this.bus.dispatch({
                    type: "GRADING_BATCH_COMMAND",
                    payload,
                    meta
                });

            case ResultCommandTypes.GENERATE_INSIGHTS:
                this.assertPayload(payload, ["examId"], "GENERATE_INSIGHTS");

                return this.bus.dispatch({
                    type: "INSIGHTS_COMMAND",
                    payload,
                    meta
                });

            default:
                throw new Error(`[AICommandNode] UNKNOWN_COMMAND: ${type}`);
        }
    }
}
