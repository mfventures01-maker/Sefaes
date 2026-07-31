// ────────────────────────────────────────────────────────────────────────────
// SEFAES COMMAND GATEWAY — EDU COMMAND GATEWAY
// Single entry point for all education (Student, Exam, Result) commands.
// Enforces: Parse/Classify → Resolve Auth → Guard Permissions → Execute → Audit
// ────────────────────────────────────────────────────────────────────────────

import { resolveAuth } from "./authResolver";
import { checkAuthGuard } from "./authGuard";
import { executeEduCommand } from "../execution/eduExecutor";
import { persistAuditLog } from "./auditPersistence";
import { generateTraceId } from "../lib/traceId";
import type { CommandResponse } from "../lib/commandTypes";
import { isEduCommand } from "../commands/eduCommands";

export async function executeEduGateway(
    command: { type: string; payload: any; traceId?: string }
): Promise<CommandResponse> {
    const traceId = command.traceId || generateTraceId("GRADE");
    const timestamp = Date.now();

    // ── STEP 1: Command Registration Check ──────────────────────────────
    if (!isEduCommand(command.type)) {
        const result: CommandResponse = {
            success: false,
            error: {
                message: `UNKNOWN_COMMAND: "${command.type}" is not a registered edu command`,
                code: 'UNKNOWN_COMMAND',
                traceId
            },
            traceId
        };

        await persistAuditLog({
            userId: 'unknown',
            commandType: command.type,
            payload: command.payload,
            timestamp,
            success: false,
            errorReason: 'UNKNOWN_COMMAND',
            traceId
        });

        return result;
    }

    // ── STEP 1.5: Zod Schema Lock ──────────────────────────────────────
    try {
        const { validateCommandSchema } = await import('../validation/commandSchema');
        validateCommandSchema(command.type, command.payload);
    } catch (zodError: any) {
        await persistAuditLog({
            userId: 'unknown',
            commandType: command.type,
            payload: command.payload,
            timestamp,
            success: false,
            errorReason: `SCHEMA_VALIDATION_FAILED: ${zodError.message}`,
            traceId
        });

        return {
            success: false,
            error: {
                message: `SCHEMA_VALIDATION_FAILED: ${zodError.message}`,
                code: 'SCHEMA_VALIDATION_FAILED',
                traceId
            },
            traceId
        };
    }

    // STATE 1: AUTH RESOLUTION
    const authResult = await resolveAuth();

    if (authResult.authenticated === false) {
        const rejectionReason = authResult.reason || "AUTH_REQUIRED";
        
        await persistAuditLog({
            userId: "unauthenticated",
            commandType: command.type,
            payload: command.payload,
            success: false,
            errorReason: rejectionReason,
            timestamp,
            traceId
        });

        return {
            success: false,
            error: { 
                message: `Authentication required: ${rejectionReason}`,
                code: "AUTH_REQUIRED", 
                traceId 
            },
            traceId
        };
    }

    const identity = authResult.identity;

    // STATE 2: PERMISSION CHECK
    const allowed = checkAuthGuard(command.type, identity, command.payload);

    if (!allowed.allowed) {
        const rejectionReason = allowed.reason || "ACCESS_DENIED";

        await persistAuditLog({
            userId: identity.userId,
            commandType: command.type,
            payload: command.payload,
            success: false,
            errorReason: rejectionReason,
            timestamp,
            traceId
        });

        return {
            success: false,
            error: { 
                message: `Access Denied: ${rejectionReason}`,
                code: rejectionReason, 
                traceId 
            },
            traceId
        };
    }

    // STATE 3: EXECUTION
    try {
        const result = await executeEduCommand(command, identity);

        // STATE 4: AUDIT
        await persistAuditLog({
            userId: identity.userId,
            commandType: command.type,
            payload: command.payload,
            success: result.success,
            errorReason: result.error,
            timestamp,
            traceId
        });

        if (result.success) {
            return {
                success: true,
                data: result.data,
                traceId
            };
        } else {
            return {
                success: false,
                error: {
                    message: result.error || "EXECUTION_FAILED",
                    code: "EXECUTION_FAILED",
                    traceId
                },
                traceId
            };
        }
    } catch (err: any) {
        const errorMessage = err.message || "INTERNAL_EXECUTION_ERROR";

        await persistAuditLog({
            userId: identity.userId,
            commandType: command.type,
            payload: command.payload,
            success: false,
            errorReason: errorMessage,
            timestamp,
            traceId
        });

        return {
            success: false,
            error: {
                message: `Execution error: ${errorMessage}`,
                code: "GATEWAY_ERROR",
                traceId
            },
            traceId
        };
    }
}
