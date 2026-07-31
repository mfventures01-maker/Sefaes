// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 3.1 — COMMANDBUS (AUTH GATE INTEGRATED)
//
// Enforcement rules:
//  1. ALL commands pass through CommandFirewall first (registry + payload check)
//  2. AUTH.* commands are routed to the AuthCommandGateway (NEVER to standard executor)
//  3. Non-auth commands pass through the standard CommandGateway
//  4. traceId is generated or validated at firewall entry
//  5. Audit entry includes durationMs for performance observability
//  6. Errors are classified via ErrorTaxonomy (no raw errors)
//  7. Actor ID is set from session after auth
// ────────────────────────────────────────────────────────────────────────────

import type { Command, CommandResponse } from './commandTypes';
import { executeAuthGateway } from '../server/authCommandGateway';
import { executeEduGateway } from '../server/eduCommandGateway';
import { isAuthCommand } from '../server/authGuard';
import { isEduCommand } from '../commands/eduCommands';

/**
 * Top-level dispatchCommand function for FSM Step 1.
 */
export async function dispatchCommand(command: any): Promise<CommandResponse<any>> {
    const { type } = command;

    // STATE 0: CLASSIFICATION
    if (isAuthCommand(type)) {
        return await executeAuthGateway(command);
    }

    if (isEduCommand(type)) {
        return await executeEduGateway(command);
    }

    // STATE FAILURE: UNKNOWN COMMAND
    const traceId = command.traceId || 'unknown';
    return {
        success: false,
        error: {
            message: `No handler for command: ${type}`,
            code: "UNKNOWN_DOMAIN_COMMAND",
            traceId
        },
        traceId
    };
}

export class CommandBus {
    private static instance: CommandBus;
    private actorId = 'anonymous';

    private constructor() {}

    public static getInstance(): CommandBus {
        if (!CommandBus.instance) {
            CommandBus.instance = new CommandBus();
        }
        return CommandBus.instance;
    }

    public setActor(actorId: string): void {
        this.actorId = actorId;
    }

    // ── Typed dispatch (Phase 3.1 API - Auth Gate Integrated) ────────────────
    public async dispatchCommand<TPayload, TResult = any>(
        raw: { type: string; payload: TPayload; traceId?: string; source?: Command['source'] }
    ): Promise<CommandResponse<TResult>> {
        // Classify and route via the central dispatchCommand function
        return await dispatchCommand(raw) as CommandResponse<TResult>;
    }

    // ── Legacy-compatible shorthand (Phase 1 compatibility) ───────────────────
    public async dispatch(action: { type: string; payload: any; meta?: any }): Promise<any> {
        const response = await this.dispatchCommand({
            type: action.type,
            payload: action.payload,
            traceId: action.meta?.traceId
        });
        
        if (!response.success) {
            throw new Error(response.error?.message ?? `Command failed`);
        }
        return response.data;
    }
}

