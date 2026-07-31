// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 2.1 — PERSISTENT COMMAND QUEUE
// Jobs survive page reload. Failed jobs auto-retry on boot.
// Storage: localStorage (dev) → upgradeable to Supabase table in production.
// ────────────────────────────────────────────────────────────────────────────

import type { Command, CommandResponse } from './commandTypes';
import { auditDispatch, auditSuccess, auditFailure } from './auditLog';

const QUEUE_KEY = 'sefaes_persistent_queue';

export type PersistentJob<TPayload = unknown> = {
    jobId: string;
    command: Command<TPayload>;
    status: 'pending' | 'processing' | 'failed' | 'completed';
    retryCount: number;
    maxRetries: number;
    lastError?: string;
    createdAt: number;
    updatedAt: number;
};

type WorkerMap = Map<string, (payload: unknown, traceId: string) => Promise<unknown>>;

// ── In-memory mirror of the persisted queue ───────────────────────────────────
let _jobs: PersistentJob[] = [];
let _processing = false;
const _workers: WorkerMap = new Map();
const _completionHandlers = new Map<string, (r: CommandResponse) => void>();

// ── Hydration ────────────────────────────────────────────────────────────────
function load(): void {
    try {
        const raw = localStorage.getItem(QUEUE_KEY);
        _jobs = raw ? (JSON.parse(raw) as PersistentJob[]) : [];
        // Reset any jobs stuck in "processing" from a crashed session
        _jobs = _jobs.map(j =>
            j.status === 'processing' ? { ...j, status: 'pending', updatedAt: Date.now() } : j
        );
        persist();
    } catch {
        _jobs = [];
    }
}

function persist(): void {
    try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(_jobs));
    } catch {
        // Storage full — not fatal
    }
}

// Hydrate on module load
load();

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Registers a worker function for a command type.
 * Workers are the actual execution logic for async commands.
 */
export function registerWorker<TPayload>(
    commandType: string,
    worker: (payload: TPayload, traceId: string) => Promise<unknown>
): void {
    _workers.set(commandType, worker as (payload: unknown, traceId: string) => Promise<unknown>);
}

/**
 * Adds a command to the persistent queue.
 * Returns a Promise that resolves when the job completes or fails permanently.
 */
export function enqueueCommand<TPayload>(
    command: Command<TPayload>,
    maxRetries = 2
): Promise<CommandResponse> {
    return new Promise((resolve) => {
        const jobId = `${command.traceId}-PQ`;
        const job: PersistentJob<TPayload> = {
            jobId,
            command,
            status: 'pending',
            retryCount: 0,
            maxRetries,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        _jobs.push(job as PersistentJob);
        persist();
        auditDispatch(command.traceId, `QUEUE:${command.type}`, command.source, command.payload as Record<string, unknown>);

        _completionHandlers.set(jobId, resolve);

        if (!_processing) {
            processQueue();
        }
    });
}

/**
 * Returns all jobs in the queue (snapshot).
 */
export function getQueueSnapshot(): PersistentJob[] {
    return [..._jobs];
}

/**
 * On boot: retry any failed jobs that still have retries remaining.
 */
export function retryFailedJobs(): void {
    let changed = false;
    _jobs = _jobs.map(j => {
        if (j.status === 'failed' && j.retryCount < j.maxRetries) {
            changed = true;
            return { ...j, status: 'pending', updatedAt: Date.now() };
        }
        return j;
    });
    if (changed) {
        persist();
        if (!_processing) processQueue();
    }
}

// ── Internal Queue Processor ──────────────────────────────────────────────────
async function processQueue(): Promise<void> {
    _processing = true;

    while (_jobs.some(j => j.status === 'pending')) {
        const job = _jobs.find(j => j.status === 'pending');
        if (!job) break;

        // Mark as processing
        job.status = 'processing';
        job.updatedAt = Date.now();
        persist();

        const worker = _workers.get(job.command.type);

        if (!worker) {
            // No worker registered — fail permanently
            job.status = 'failed';
            job.lastError = `No worker registered for command: ${job.command.type}`;
            job.updatedAt = Date.now();
            persist();

            const response: CommandResponse = {
                success: false,
                error: {
                    message: `No handler found for operation. Reference: ${job.command.traceId}`,
                    code: 'COMMAND_NOT_REGISTERED',
                    traceId: job.command.traceId,
                },
                traceId: job.command.traceId,
            };
            auditFailure(job.command.traceId, `QUEUE:${job.command.type}`, 'system', job.lastError);
            _completionHandlers.get(job.jobId)?.(response);
            _completionHandlers.delete(job.jobId);
            continue;
        }

        try {
            const data = await worker(job.command.payload, job.command.traceId);
            job.status = 'completed';
            job.updatedAt = Date.now();
            persist();

            const response: CommandResponse = { success: true, data, traceId: job.command.traceId };
            auditSuccess(job.command.traceId, `QUEUE:${job.command.type}`, 'system');
            _completionHandlers.get(job.jobId)?.(response);
            _completionHandlers.delete(job.jobId);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            job.retryCount++;
            job.lastError = msg;
            job.updatedAt = Date.now();

            if (job.retryCount <= job.maxRetries) {
                job.status = 'pending';
                persist();
                auditFailure(job.command.traceId, `QUEUE:${job.command.type}`, 'system', `Retry ${job.retryCount}/${job.maxRetries}: ${msg}`);
                // Exponential back-off
                await new Promise(r => setTimeout(r, 1000 * job.retryCount));
            } else {
                job.status = 'failed';
                persist();
                auditFailure(job.command.traceId, `QUEUE:${job.command.type}`, 'system', `Permanent failure: ${msg}`);

                const response: CommandResponse = {
                    success: false,
                    error: {
                        message: `Operation failed after ${job.maxRetries} retries. Reference: ${job.command.traceId}`,
                        code: 'QUEUE_MAX_RETRIES_EXCEEDED',
                        traceId: job.command.traceId,
                    },
                    traceId: job.command.traceId,
                };
                _completionHandlers.get(job.jobId)?.(response);
                _completionHandlers.delete(job.jobId);
            }
        }
    }

    _processing = false;
}
