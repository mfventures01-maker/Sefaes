// ────────────────────────────────────────────────────────────────────────────
// SEFAES COMMAND GATEWAY — EDU TEST HARNESS
// Executes test scenarios against the education domain gateway.
// ────────────────────────────────────────────────────────────────────────────

import { executeEduGateway } from '../server/eduCommandGateway';
import { getAuthAuditLog, clearAuthAuditLog } from '../server/auditPersistence';

interface TestResult {
    testName: string;
    passed: boolean;
    expected: string;
    actual: string;
    traceId?: string;
}

const results: TestResult[] = [];

function assert(testName: string, condition: boolean, expected: string, actual: string, traceId?: string) {
    results.push({ testName, passed: condition, expected, actual, traceId });
    const icon = condition ? '✔' : '✘';
    console.log(`  ${icon} ${testName}: ${condition ? 'PASS' : 'FAIL'} (expected: ${expected}, got: ${actual})`);
}

/**
 * TEST 1 — STUDENT ENROLL (REQUIRES AUTHENTICATION)
 * Expected: ❌ Rejected with AUTH_REQUIRED (unauthenticated)
 */
async function testStudentEnrollUnauthenticated(): Promise<void> {
    console.log('\n═══ TEST 1: STUDENT ENROLL UNAUTHENTICATED ═══');
    
    const command = {
        type: 'STUDENT.ENROLL',
        payload: {
            schoolId: '98b50e2d-dc99-43ef-b387-052637738f61',
            students: [
                { first_name: 'Obi', last_name: 'Eze', gender: 'M' }
            ]
        }
    };

    const response = await executeEduGateway(command);
    
    assert(
        'Enroll rejected due to no authentication',
        response.success === false,
        'success=false',
        `success=${response.success}`,
        response.traceId
    );

    assert(
        'Error code is AUTH_REQUIRED',
        response.error?.code === 'AUTH_REQUIRED',
        'AUTH_REQUIRED',
        response.error?.code || 'NONE'
    );

    console.log(`  Response: success=${response.success}, error=${response.error?.message}`);
}

/**
 * TEST 2 — EXAM CREATE (REQUIRES AUTHENTICATION)
 * Expected: ❌ Rejected with AUTH_REQUIRED (unauthenticated)
 */
async function testExamCreateUnauthenticated(): Promise<void> {
    console.log('\n═══ TEST 2: EXAM CREATE UNAUTHENTICATED ═══');
    
    const command = {
        type: 'EXAM.CREATE',
        payload: {
            p_exam_title: 'Math Semester Exam',
            p_subject_id: '98b50e2d-dc99-43ef-b387-052637738f61',
            p_class_ids: ['98b50e2d-dc99-43ef-b387-052637738f61'],
            p_teacher_id: '98b50e2d-dc99-43ef-b387-052637738f61',
            p_school_id: '98b50e2d-dc99-43ef-b387-052637738f61',
            p_duration_minutes: 60,
            p_total_marks: 100,
            p_questions: [],
            p_marking_rules: {}
        }
    };

    const response = await executeEduGateway(command);

    assert(
        'Exam creation rejected due to no authentication',
        response.success === false,
        'success=false',
        `success=${response.success}`,
        response.traceId
    );

    console.log(`  Response: success=${response.success}, error=${response.error?.message}`);
}

/**
 * TEST 3 — UNKNOWN EDU COMMAND
 * Expected: ❌ Rejected with UNKNOWN_DOMAIN_COMMAND via CommandBus
 */
import { dispatchCommand } from '../lib/CommandBus';

async function testUnknownEduCommand(): Promise<void> {
    console.log('\n═══ TEST 3: UNKNOWN DOMAIN COMMAND ═══');
    
    const command = {
        type: 'INVALID.COMMAND',
        payload: {}
    };

    const response = await dispatchCommand(command);

    assert(
        'CommandBus rejects invalid command type',
        response.success === false,
        'success=false',
        `success=${response.success}`,
        response.traceId
    );

    assert(
        'Error code is UNKNOWN_DOMAIN_COMMAND',
        response.error?.code === 'UNKNOWN_DOMAIN_COMMAND',
        'UNKNOWN_DOMAIN_COMMAND',
        response.error?.code || 'NONE'
    );

    console.log(`  Response: success=${response.success}, error=${response.error?.message}`);
}

/**
 * Execute all EDU test scenarios.
 */
export async function runEduGateTests(): Promise<TestResult[]> {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  SEFAES EDU GATE — LIVE TEST EXECUTION                      ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');

    clearAuthAuditLog();
    results.length = 0;

    await testStudentEnrollUnauthenticated();
    await testExamCreateUnauthenticated();
    await testUnknownEduCommand();

    // Summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log(`║  TEST SUMMARY: ${passed} PASSED / ${failed} FAILED / ${results.length} TOTAL`);
    console.log('╚══════════════════════════════════════════════════════════════╝');

    // Print audit trail
    const auditLog = getAuthAuditLog();
    console.log(`\n📋 Audit Trail: ${auditLog.length} entries recorded during test run`);
    auditLog.forEach((entry, i) => {
        const status = entry.success ? '✔' : '✘';
        console.log(`  ${i + 1}. [${status}] ${entry.commandType} | user: ${entry.userId} | ${entry.errorReason || 'OK'}`);
    });

    return results;
}

export { results as testResults };
