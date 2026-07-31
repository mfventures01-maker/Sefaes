// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 3 — SERVER COMMAND GATEWAY
// Simulates the backend API Endpoint / Edge Function.
// All execution authority is moved here. The frontend becomes a dumb client.
// ────────────────────────────────────────────────────────────────────────────

import { validateCommandSchema } from '../validation/commandSchema';
import { firewall } from '../lib/commandFirewall';
import { generateTraceId, namespaceFromCommand } from '../lib/traceId';
import { classifyError } from '../lib/errorTaxonomy';
import { auditDispatch, auditSuccess, auditFailure } from '../lib/auditLog';
import { CommandRouter } from './commandRouter';
import type { CommandResponse } from '../lib/commandTypes';

/**
 * The Server Entrypoint.
 * In a real Next.js/Edge app, this is what `POST /api/command` calls.
 */
export async function executeServerCommand(rawRequest: any): Promise<CommandResponse> {
    let traceId = rawRequest.traceId;

    try {
        // 1. Trace ID Generation (Server Authoritative)
        if (!traceId) {
            const ns = rawRequest.type ? namespaceFromCommand(rawRequest.type) : 'SYS';
            traceId = generateTraceId(ns);
            rawRequest.traceId = traceId;
        }

        // 2. Zod Schema Lock
        // Enforces strict shape before any business logic touches it
        try {
            validateCommandSchema(rawRequest.type, rawRequest.payload);
        } catch (zodError: any) {
            throw { message: `SCHEMA_VALIDATION_FAILED: ${zodError.message}`, isZod: true };
        }

        // 3. Command Firewall (Security & Registry Check)
        const fwResult = firewall(rawRequest);
        if (fwResult.ok === false) {
            return {
                success: false,
                error: fwResult.error,
                traceId: traceId
            };
        }

        const validCommand = fwResult.command;
        auditDispatch(traceId, validCommand.type, validCommand.source, validCommand.payload as Record<string, unknown>);

        const startTime = performance.now();

        // 4. Execution Router (Server Side)
        const data = await CommandRouter.route(validCommand);

        const durationMs = Math.round(performance.now() - startTime);
        auditSuccess(traceId, `${validCommand.type} [${durationMs}ms]`, validCommand.source);

        return {
            success: true,
            data,
            traceId
        };
    } catch (err: unknown) {
        const structuredError = classifyError(err, traceId || 'UNKNOWN-TRACE');
        auditFailure(traceId || 'UNKNOWN-TRACE', rawRequest.type || 'UNKNOWN', rawRequest.source || 'system', structuredError.message);
        return {
            success: false,
            error: structuredError,
            traceId: traceId || 'UNKNOWN-TRACE'
        };
    }
}
