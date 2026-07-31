// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 2 — SCRIPT PIPELINE STATE MACHINE
// Deterministic FSM for answer script processing.
// States: uploaded → ocr_processing → ocr_complete → grading → graded
//         Any state → failed (retryable)
// Rules:
//   - No state skipping
//   - No direct transitions to terminal states from wrong states
//   - Every transition is logged
// ────────────────────────────────────────────────────────────────────────────

import type { ScriptPipelineState, ScriptJob } from './commandTypes';
import { auditSuccess, auditFailure } from './auditLog';

/** Valid forward state transitions */
const VALID_TRANSITIONS: Record<ScriptPipelineState, ScriptPipelineState[]> = {
    uploaded:       ['ocr_processing', 'failed'],
    ocr_processing: ['ocr_complete', 'failed'],
    ocr_complete:   ['grading', 'failed'],
    grading:        ['graded', 'failed'],
    graded:         [],        // terminal — no further transitions
    failed:         ['uploaded'], // retry resets to uploaded
};

/** In-memory job registry — keyed by jobId */
const _jobs = new Map<string, ScriptJob>();

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Registers a new job in the `uploaded` state.
 */
export function registerJob(job: Omit<ScriptJob, 'state' | 'retryCount' | 'createdAt' | 'updatedAt'>): ScriptJob {
    const now = Date.now();
    const fullJob: ScriptJob = {
        ...job,
        state: 'uploaded',
        retryCount: 0,
        createdAt: now,
        updatedAt: now,
    };
    _jobs.set(job.jobId, fullJob);
    auditSuccess(job.traceId, 'SCRIPT_JOB_REGISTERED', job.teacherId);
    return fullJob;
}

/**
 * Transitions a job to the next state.
 * Throws immediately if the transition is invalid.
 */
export function transitionJob(
    jobId: string,
    nextState: ScriptPipelineState,
    meta?: { ocrText?: string; error?: ScriptJob['error'] }
): ScriptJob {
    const job = _jobs.get(jobId);
    if (!job) {
        throw new Error(`SCRIPT_JOB_NOT_FOUND: jobId=${jobId}`);
    }

    const allowed = VALID_TRANSITIONS[job.state];
    if (!allowed.includes(nextState)) {
        const msg = `INVALID_STATE_TRANSITION: ${job.state} → ${nextState} is not permitted`;
        auditFailure(job.traceId, 'SCRIPT_TRANSITION', job.teacherId, msg);
        throw new Error(msg);
    }

    const updated: ScriptJob = {
        ...job,
        state: nextState,
        ocrText: meta?.ocrText ?? job.ocrText,
        error: meta?.error ?? (nextState !== 'failed' ? undefined : job.error),
        retryCount: nextState === 'uploaded' ? job.retryCount + 1 : job.retryCount,
        updatedAt: Date.now(),
    };

    _jobs.set(jobId, updated);
    auditSuccess(job.traceId, `SCRIPT_${nextState.toUpperCase()}`, job.teacherId);
    return updated;
}

/**
 * Marks a job as failed with a reason.
 */
export function failJob(jobId: string, error: ScriptJob['error']): ScriptJob {
    return transitionJob(jobId, 'failed', { error });
}

/**
 * Retries a failed job by resetting it to `uploaded`.
 * Throws if job is not in `failed` state.
 */
export function retryJob(jobId: string): ScriptJob {
    const job = _jobs.get(jobId);
    if (!job) throw new Error(`SCRIPT_JOB_NOT_FOUND: jobId=${jobId}`);
    if (job.state !== 'failed') throw new Error(`RETRY_INVALID: job ${jobId} is in state "${job.state}", not "failed"`);
    return transitionJob(jobId, 'uploaded');
}

/** Returns a snapshot of all jobs */
export function getAllJobs(): ScriptJob[] {
    return [..._jobs.values()];
}

/** Returns a single job by ID */
export function getJob(jobId: string): ScriptJob | undefined {
    return _jobs.get(jobId);
}
