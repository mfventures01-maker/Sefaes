// ────────────────────────────────────────────────────────────────────────────
// SEFAES COMMAND AUTH GATE — UNIFIED AUTH COMMAND GATEWAY
// Single entry point for ALL authentication commands.
// FLOW: Request → AuthCommandGateway → AuthResolver → AuthGuard → Executor → DB
// ────────────────────────────────────────────────────────────────────────────

import { resolveAuth, getPublicIdentity, type ResolvedIdentity } from './authResolver';
import { checkAuthGuard, isAuthCommand, isPublicCommand } from './authGuard';
import { executeAuthCommand } from './authExecutor';
import { persistAuditLog } from './auditPersistence';
import { generateTraceId } from '../lib/traceId';
import type { CommandResponse } from '../lib/commandTypes';

export interface AuthCommandRequest {
    type: string;
    payload: Record<string, any>;
    traceId?: string;
}

/**
 * The Auth Command Gateway.
 * Enforces the full pipeline: Parse → Resolve → Guard → Execute → Audit.
 * This is the ONLY legal path for auth operations.
 */
export async function executeAuthGateway(
    request: AuthCommandRequest
): Promise<CommandResponse> {
    const traceId = request.traceId || generateTraceId('AUTH');
    const timestamp = Date.now();

    // ── STEP 1: Command Registration Check ──────────────────────────────
    if (!isAuthCommand(request.type)) {
        const result: CommandResponse = {
            success: false,
            error: {
                message: `UNKNOWN_COMMAND: "${request.type}" is not a registered auth command`,
                code: 'UNKNOWN_COMMAND',
                traceId
            },
            traceId
        };

        await persistAuditLog({
            userId: 'unknown',
            commandType: request.type,
            payload: request.payload,
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
        validateCommandSchema(request.type, request.payload);
    } catch (zodError: any) {
        await persistAuditLog({
            userId: 'unknown',
            commandType: request.type,
            payload: request.payload,
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

    // ── STEP 2: Auth Resolution ─────────────────────────────────────────
    let identity: ResolvedIdentity;

    if (isPublicCommand(request.type)) {
        // Public commands (SIGNUP_SELF, SIGN_IN, RESET_PASSWORD, UPDATE_PASSWORD) don't require existing auth
        identity = getPublicIdentity();
    } else {
        // All other commands require a valid session/JWT
        const authResult = await resolveAuth(undefined, request.type);
        if (authResult.authenticated === false) {
            const rejectionReason = authResult.reason;
            const result: CommandResponse = {
                success: false,
                error: {
                    message: `AUTHENTICATION_REQUIRED: ${rejectionReason}`,
                    code: 'AUTHENTICATION_REQUIRED',
                    traceId
                },
                traceId
            };

            await persistAuditLog({
                userId: 'unauthenticated',
                commandType: request.type,
                payload: request.payload,
                timestamp,
                success: false,
                errorReason: rejectionReason,
                traceId
            });

            return result;
        }
        identity = authResult.identity;
    }

    // ── STEP 3: Permission Guard ────────────────────────────────────────
    const guardResult = checkAuthGuard(request.type, identity, request.payload);
    if (!guardResult.allowed) {
        const result: CommandResponse = {
            success: false,
            error: {
                message: `ACCESS_DENIED: ${guardResult.reason}`,
                code: guardResult.reason || 'ACCESS_DENIED',
                traceId
            },
            traceId
        };

        await persistAuditLog({
            userId: identity.userId,
            commandType: request.type,
            payload: request.payload,
            timestamp,
            success: false,
            errorReason: guardResult.reason || 'ACCESS_DENIED',
            traceId
        });

        return result;
    }

    // ── STEP 4: Execute Command ─────────────────────────────────────────
    try {
        const execResult = await executeAuthCommand(request.type, request.payload, identity);

        // ── STEP 5: Audit Log ───────────────────────────────────────────
        await persistAuditLog({
            userId: execResult.data?.userId || identity.userId,
            commandType: request.type,
            payload: request.payload,
            timestamp,
            success: execResult.success,
            errorReason: execResult.error,
            traceId
        });

        if (execResult.success) {
            return {
                success: true,
                data: execResult.data,
                traceId
            };
        } else {
            return {
                success: false,
                error: {
                    message: execResult.error || 'EXECUTION_FAILED',
                    code: 'EXECUTION_FAILED',
                    traceId
                },
                traceId
            };
        }
    } catch (err: any) {
        await persistAuditLog({
            userId: identity.userId,
            commandType: request.type,
            payload: request.payload,
            timestamp,
            success: false,
            errorReason: err.message,
            traceId
        });

        return {
            success: false,
            error: {
                message: `GATEWAY_ERROR: ${err.message}`,
                code: 'GATEWAY_ERROR',
                traceId
            },
            traceId
        };
    }
}

