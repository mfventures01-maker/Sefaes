// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 2 — ASYNC COMMAND QUEUE
// Handles long-running operations (OCR, AI grading, large uploads) off-thread.
// Provides retry safety, failure isolation, and non-blocking UI behavior.
//
// Flow: Command → Queue → Worker → Result → CommandBus update
// ────────────────────────────────────────────────────────────────────────────

import type { CommandResponse } from './commandTypes';
import { auditDispatch, auditSuccess, auditFailure } from './auditLog';

export type QueuedJob<TPayload = unknown, TResult = unknown> = {
    jobId: string;
    traceId: string;
    commandType: string;
    payload: TPayload;
    retries: number;
    maxRetries: number;
    status: 'pending' | 'running' | 'done' | 'failed';
    result?: CommandResponse<TResult>;
    enqueuedAt: number;
};

export type WorkerFn<TPayload, TResult> = (payload: TPayload, traceId: string) => Promise<TResult>;

const _queue: QueuedJob[] = [];
let _processing = false;
const _listeners = new Map<string, (result: CommandResponse) => void>();

/** Returns the current queue snapshot */
export function getQueue(): QueuedJob[] {
    return [..._queue];
}

/**
 * Adds a job to the async queue and starts processing if not already running.
 * Returns a Promise that resolves when the job completes or exhausts retries.
 */
export function enqueue<TPayload, TResult>(
    traceId: string,
    commandType: string,
    payload: TPayload,
    worker: WorkerFn<TPayload, TResult>,
    maxRetries = 2
): Promise<CommandResponse<TResult>> {
    return new Promise((resolve) => {
        const jobId = `${traceId}-Q`;
        const job: QueuedJob<TPayload, TResult> = {
            jobId,
            traceId,
            commandType,
            payload,
            retries: 0,
            maxRetries,
            status: 'pending',
            enqueuedAt: Date.now(),
        };

        _queue.push(job as QueuedJob);
        auditDispatch(traceId, `QUEUE:${commandType}`, 'system', payload as Record<string, unknown>);

        _listeners.set(jobId, resolve as (r: CommandResponse) => void);

        if (!_processing) {
            processQueue(worker as WorkerFn<unknown, unknown>);
        }
    });
}

async function processQueue(worker: WorkerFn<unknown, unknown>): Promise<void> {
    _processing = true;

    while (_queue.some(j => j.status === 'pending')) {
        const job = _queue.find(j => j.status === 'pending');
        if (!job) break;

        job.status = 'running';

        try {
            const data = await worker(job.payload, job.traceId);
            job.status = 'done';
            const response: CommandResponse = {
                success: true,
                data,
                traceId: job.traceId,
            };
            job.result = response;
            auditSuccess(job.traceId, `QUEUE:${job.commandType}`, 'system');
            _listeners.get(job.jobId)?.(response);
            _listeners.delete(job.jobId);
        } catch (err: unknown) {
            job.retries++;
            const errMsg = err instanceof Error ? err.message : String(err);

            if (job.retries <= job.maxRetries) {
                // Retry: reset to pending
                job.status = 'pending';
                auditFailure(job.traceId, `QUEUE:${job.commandType}`, 'system', `Retrying (${job.retries}/${job.maxRetries}): ${errMsg}`);
                // Short back-off before retry
                await new Promise(r => setTimeout(r, 1000 * job.retries));
            } else {
                job.status = 'failed';
                const response: CommandResponse = {
                    success: false,
                    error: {
                        message: `Operation failed after ${job.maxRetries} retries. Please try again.`,
                        code: 'QUEUE_MAX_RETRIES_EXCEEDED',
                        traceId: job.traceId,
                    },
                    traceId: job.traceId,
                };
                job.result = response;
                auditFailure(job.traceId, `QUEUE:${job.commandType}`, 'system', errMsg);
                _listeners.get(job.jobId)?.(response);
                _listeners.delete(job.jobId);
            }
        }
    }

    _processing = false;
}
