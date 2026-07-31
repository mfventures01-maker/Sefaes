// ────────────────────────────────────────────────────────────────────────────
// SEFAES PRE-DAY 4 FSM SYSTEM VERIFIER & AUDIT HARNESS
// Hardens and verifies Phase 2-3 system constraints.
// ────────────────────────────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import { dispatchCommand, CommandBus } from '../lib/CommandBus';
import { COMMANDS } from '../lib/commandRegistry';
import { setMockIdentity } from '../server/authResolver';
import { getAuthAuditLog, clearAuthAuditLog } from '../server/auditPersistence';
import { setMockAuthUser, setMockDbSelect } from '../db/dbGateway';
import { setMockQueryResult, setMockRpcResult } from '../lib/rpcClient';
import { supabase } from '../lib/supabase';

// Mock database for exams
export const mockExamDb: Record<string, { id: string; status: string }> = {};

const mockSupabaseFrom = (table: string) => {
    return {
        select: (columns: string) => {
            return {
                eq: (colName: string, val: any) => {
                    return {
                        single: async () => {
                            if (table === 'exams') {
                                const exam = mockExamDb[val];
                                if (exam) {
                                    return { data: exam, error: null };
                                }
                                return { data: null, error: new Error('Exam not found') };
                            }
                            if (table === 'grading_jobs') {
                                return { data: { attempts: 0 }, error: null };
                            }
                            return { data: null, error: null };
                        }
                    };
                }
            };
        },
        update: (values: any) => {
            return {
                eq: (colName: string, val: any) => {
                    if (table === 'exams') {
                        if (mockExamDb[val]) {
                            mockExamDb[val].status = values.status;
                        }
                    }
                    return Promise.resolve({ error: null });
                }
            };
        }
    };
};

// Set the supabase from method mock
(supabase as any).from = mockSupabaseFrom;

// Set the supabase rpc method mock
(supabase as any).rpc = async (name: string, payload?: any) => {
    if (name === 'finalize_grading') {
        return { data: { success: true }, error: null };
    }
    return { data: null, error: { message: `RPC_NOT_MOCKED: ${name}` } };
};

// Ensure test flags are set
process.env.TEST_ENV = 'true';
process.env.VITE_SUPABASE_URL = 'https://placeholder.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'placeholder-anon-key';

interface HarnessTestResult {
    category: string;
    description: string;
    passed: boolean;
    errorDetail?: string;
}

const testResults: HarnessTestResult[] = [];

function assertTest(category: string, description: string, condition: boolean, errorDetail?: string) {
    testResults.push({ category, description, passed: condition, errorDetail });
    const statusText = condition ? '✔ PASS' : '❌ FAIL';
    console.log(`  [${category}] ${statusText} - ${description}`);
    if (!condition && errorDetail) {
        console.error(`    ↳ Detail: ${errorDetail}`);
    }
}

// Helper to scan directory recursively
function getFilesRecursively(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursively(filePath));
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            results.push(filePath);
        }
    });
    return results;
}

// ── TASK 3: COMMAND REGISTRY CONSISTENCY CHECK ────────────────────────────────
function verifyRegistry() {
    console.log('\n--- TASK 3: COMMAND REGISTRY CONSISTENCY CHECK ---');
    try {
        const commandValues = Object.values(COMMANDS);
        
        // 1. Verify no duplicate command strings (ignoring allowed plural/singular/legacy aliases)
        const duplicates = commandValues
            .filter((item, index) => commandValues.indexOf(item) !== index)
            .filter(item => {
                const allowedAliases = [
                    'STUDENT.READ',
                    'EXAM.CREATE',
                    'EXAM.READ',
                    'EXAM.READ_WITH_SCHEMES',
                    'RESULT.READ',
                    'RESULT.STATUS_READ',
                    'RESULT.START_GRADING'
                ];
                return !allowedAliases.includes(item);
            });
        assertTest(
            'REGISTRY',
            'No duplicate command strings exist in commandRegistry.ts',
            duplicates.length === 0,
            duplicates.length > 0 ? `Duplicates found: ${duplicates.join(', ')}` : undefined
        );

        // 2. Verify all commands follow strict namespacing (AUTH.*, STUDENT.*, EXAM.*, RESULT.*, CBT.*)
        const invalidFormat = commandValues.filter(val => {
            const prefix = val.split('.')[0];
            return !['AUTH', 'STUDENT', 'EXAM', 'RESULT', 'CBT'].includes(prefix);
        });
        assertTest(
            'REGISTRY',
            'All commands are namespaced under AUTH, STUDENT, EXAM, or RESULT',
            invalidFormat.length === 0,
            invalidFormat.length > 0 ? `Invalid prefixes in: ${invalidFormat.join(', ')}` : undefined
        );
    } catch (err: any) {
        assertTest('REGISTRY', 'Registry verification did not throw error', false, err.message);
    }
}

// ── TASK 4: AUTHORIZATION IMMUTABILITY TEST ──────────────────────────────────
function verifyAuthorizationImmutability() {
    console.log('\n--- TASK 4: AUTHORIZATION IMMUTABILITY TEST ---');
    try {
        const uiDirs = [
            path.resolve('src/components'),
            path.resolve('src/pages')
        ];
        let uiFiles: string[] = [];
        uiDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                uiFiles = uiFiles.concat(getFilesRecursively(dir));
            }
        });

        let directAuthCalls = 0;
        let hardcodedRoleChecks = 0;

        uiFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf-8');
            // Remove comments to prevent false positives on documentation
            const cleanedContent = content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');

            if (cleanedContent.includes('supabase.auth.')) {
                directAuthCalls++;
                console.warn(`    [WARNING] Direct supabase.auth call found in: ${file}`);
            }
            if (cleanedContent.includes('role === "admin"') || cleanedContent.includes("role === 'admin'")) {
                hardcodedRoleChecks++;
                console.warn(`    [WARNING] Hardcoded admin role check found in: ${file}`);
            }
            if (cleanedContent.includes('isAdmin') && !file.includes('authGuard') && !file.includes('authResolver')) {
                hardcodedRoleChecks++;
                console.warn(`    [WARNING] Hardcoded isAdmin check found in: ${file}`);
            }
        });

        assertTest(
            'IMMUTABILITY',
            'No direct Supabase Auth API calls exist in the UI layer',
            directAuthCalls === 0,
            `${directAuthCalls} violations found in UI files.`
        );

        assertTest(
            'IMMUTABILITY',
            'No hardcoded role checks (e.g. role === "admin", isAdmin) exist in the UI layer',
            hardcodedRoleChecks === 0,
            `${hardcodedRoleChecks} violations found in UI files.`
        );
    } catch (err: any) {
        assertTest('IMMUTABILITY', 'UI scanner completed without crashing', false, err.message);
    }
}

// ── TASK 5: EXECUTOR ISOLATION TEST ──────────────────────────────────────────
function verifyExecutorIsolation() {
    console.log('\n--- TASK 5: EXECUTOR ISOLATION TEST ---');
    const executors = [
        { name: 'StudentExecutor', path: 'src/execution/studentExecutor.ts' },
        { name: 'ExamExecutor', path: 'src/execution/examExecutor.ts' },
        { name: 'ResultExecutor', path: 'src/execution/resultExecutor.ts' },
        { name: 'AuthExecutor', path: 'src/server/authExecutor.ts' }
    ];

    executors.forEach(exec => {
        const fullPath = path.resolve(exec.path);
        if (!fs.existsSync(fullPath)) {
            assertTest('ISOLATION', `${exec.name} file exists`, false, `File not found at: ${exec.path}`);
            return;
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        const imports = content.match(/import\s+[\s\S]*?\s+from\s+['"].*?['"]/g) || [];
        
        let hasDirectAuth = false;
        let hasGatewayImports = false;
        let hasCrossDomain = false;

        if (content.includes('supabase.auth') && exec.name !== 'AuthExecutor') {
            hasDirectAuth = true;
        }

        // Check if executor imports command gateways or other executors
        imports.forEach(imp => {
            if (imp.includes('authCommandGateway') || imp.includes('eduCommandGateway') || imp.includes('CommandBus')) {
                hasGatewayImports = true;
            }
            if (exec.name === 'StudentExecutor' && (imp.includes('examExecutor') || imp.includes('resultExecutor'))) {
                hasCrossDomain = true;
            }
            if (exec.name === 'ExamExecutor' && (imp.includes('studentExecutor') || imp.includes('resultExecutor') || imp.includes('onboardingService'))) {
                hasCrossDomain = true;
            }
            if (exec.name === 'ResultExecutor' && (imp.includes('studentExecutor') || imp.includes('examExecutor') || imp.includes('onboardingService'))) {
                hasCrossDomain = true;
            }
        });

        assertTest(
            'ISOLATION',
            `${exec.name} has no direct supabase.auth calls`,
            !hasDirectAuth,
            `${exec.name} contains direct supabase.auth access.`
        );

        assertTest(
            'ISOLATION',
            `${exec.name} does not import gateways or command loop classes`,
            !hasGatewayImports,
            `${exec.name} imports gateway/bus modules.`
        );

        assertTest(
            'ISOLATION',
            `${exec.name} maintains domain isolation (no cross-domain calls)`,
            !hasCrossDomain,
            `${exec.name} has cross-domain leaks in imports.`
        );
    });
}

// ── TASK 7: GATEWAY DETECTION INTEGRITY ──────────────────────────────────────
function verifyGatewayIntegrity() {
    console.log('\n--- TASK 7: GATEWAY DETECTION INTEGRITY ---');
    try {
        const cbPath = path.resolve('src/lib/CommandBus.ts');
        const content = fs.readFileSync(cbPath, 'utf-8');
        
        // CommandBus must route exclusively to AuthGateway or EduGateway
        const containsAuthCheck = content.includes('isAuthCommand(type)') || content.includes('isAuthCommand(raw.type)');
        const containsEduCheck = content.includes('isEduCommand(type)') || content.includes('isEduCommand(raw.type)');
        const returnsUnknown = content.includes('UNKNOWN_DOMAIN_COMMAND');

        assertTest(
            'INTEGRITY',
            'CommandBus classifies and routes AUTH commands to AuthGateway',
            containsAuthCheck
        );

        assertTest(
            'INTEGRITY',
            'CommandBus classifies and routes EDU commands to EduGateway',
            containsEduCheck
        );

        assertTest(
            'INTEGRITY',
            'CommandBus rejects unclassified commands with UNKNOWN_DOMAIN_COMMAND',
            returnsUnknown
        );
    } catch (err: any) {
        assertTest('INTEGRITY', 'CommandBus read check succeeded', false, err.message);
    }
}

// ── TASK 2 & 6: FSM FLOW AND AUDIT COMPLETENESS TESTS ──────────────────────────
async function runFsmFlowTests() {
    console.log('\n--- TASK 2: FSM STATE FLOW & AUDIT COMPLETENESS TESTS ---');
    clearAuthAuditLog();

    const mockAdmin = {
        id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e1',
        email: 'admin@sefaes.edu.ng',
        app_metadata: { role: 'admin' }
    };

    const mockTeacher = {
        id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e2',
        email: 'teacher@sefaes.edu.ng',
        app_metadata: { role: 'teacher' }
    };

    // 1. AUTH COMMAND FLOW
    console.log('  Executing Auth Flow Positive Tests...');
    setMockIdentity({
        userId: mockAdmin.id,
        role: mockAdmin.app_metadata.role,
        email: mockAdmin.email
    });
    setMockAuthUser(mockAdmin);
    setMockDbSelect([]);
    setMockQueryResult([]);
    setMockRpcResult({ success: true });
    
    // AUTH.GET_USER
    const resGetUser = await dispatchCommand({
        type: 'AUTH.GET_USER',
        payload: {}
    });
    assertTest('FSM_FLOW', 'AUTH.GET_USER executed successfully via FSM', resGetUser.success === true, JSON.stringify(resGetUser.error));

    // AUTH.SIGN_OUT
    const resSignOut = await dispatchCommand({
        type: 'AUTH.SIGN_OUT',
        payload: {}
    });
    assertTest('FSM_FLOW', 'AUTH.SIGN_OUT executed successfully via FSM', resSignOut.success === true, JSON.stringify(resSignOut.error));

    // 2. EDU COMMAND FLOW (READ ONLY)
    console.log('  Executing Edu Flow Positive Tests...');
    setMockIdentity({
        userId: mockTeacher.id,
        role: mockTeacher.app_metadata.role,
        email: mockTeacher.email
    });
    setMockAuthUser(mockTeacher);
    setMockDbSelect([]);

    // STUDENT.READ
    const resStudentRead = await dispatchCommand({
        type: 'STUDENT.READ',
        payload: { schoolId: '98b50e2d-dc99-43ef-b387-052637738f62' }
    });
    assertTest('FSM_FLOW', 'STUDENT.READ executed successfully via FSM', resStudentRead.success === true, JSON.stringify(resStudentRead.error));

    // EXAM.READ
    const resExamRead = await dispatchCommand({
        type: 'EXAM.READ',
        payload: { schoolId: '98b50e2d-dc99-43ef-b387-052637738f62' }
    });
    assertTest('FSM_FLOW', 'EXAM.READ executed successfully via FSM', resExamRead.success === true, JSON.stringify(resExamRead.error));

    // RESULT.READ
    const resResultRead = await dispatchCommand({
        type: 'RESULT.READ',
        payload: { schoolId: '98b50e2d-dc99-43ef-b387-052637738f62' }
    });
    assertTest('FSM_FLOW', 'RESULT.READ executed successfully via FSM', resResultRead.success === true, JSON.stringify(resResultRead.error));

    // 3. NEGATIVE TESTS
    console.log('  Executing Negative Flow Tests...');
    
    // INVALID.COMMAND
    const resInvalid = await dispatchCommand({
        type: 'INVALID.COMMAND',
        payload: {}
    });
    assertTest('FSM_FLOW', 'INVALID.COMMAND is rejected at STATE 0', resInvalid.success === false && resInvalid.error?.code === 'UNKNOWN_DOMAIN_COMMAND');

    // RANDOM.STRING
    const resRandom = await dispatchCommand({
        type: 'RANDOM.STRING',
        payload: {}
    });
    assertTest('FSM_FLOW', 'RANDOM.STRING is rejected at STATE 0', resRandom.success === false && resRandom.error?.code === 'UNKNOWN_DOMAIN_COMMAND');

    // UNREGISTERED.EXEC
    const resUnregistered = await dispatchCommand({
        type: 'UNREGISTERED.EXEC',
        payload: {}
    });
    assertTest('FSM_FLOW', 'UNREGISTERED.EXEC is rejected at STATE 0', resUnregistered.success === false && resUnregistered.error?.code === 'UNKNOWN_DOMAIN_COMMAND');

    // 5. EXAM LIFECYCLE FSM TRANSITION TESTS
    console.log('\n--- DAY 4: EXAM LIFECYCLE FSM TESTS ---');

    const examId = 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0ea';
    mockExamDb[examId] = { id: examId, status: 'DRAFT' };

    // Set mock identity to admin for valid transitions
    setMockIdentity({
        userId: mockAdmin.id,
        role: mockAdmin.app_metadata.role,
        email: mockAdmin.email
    });
    setMockAuthUser(mockAdmin);

    // Test case 1: DRAFT -> REVIEW
    const resDraftToReview = await dispatchCommand({
        type: 'EXAM.TRANSITION_STATE',
        payload: { examId, fromState: 'DRAFT', toState: 'REVIEW' }
    });
    assertTest('EXAM_FSM', 'Transition DRAFT -> REVIEW succeeds for Admin', resDraftToReview.success === true, JSON.stringify(resDraftToReview.error));
    assertTest('EXAM_FSM', 'Exam state is now REVIEW', mockExamDb[examId]?.status === 'REVIEW');

    // Test case 2: REVIEW -> APPROVED
    const resReviewToApproved = await dispatchCommand({
        type: 'EXAM.TRANSITION_STATE',
        payload: { examId, fromState: 'REVIEW', toState: 'APPROVED' }
    });
    assertTest('EXAM_FSM', 'Transition REVIEW -> APPROVED succeeds for Admin', resReviewToApproved.success === true, JSON.stringify(resReviewToApproved.error));
    assertTest('EXAM_FSM', 'Exam state is now APPROVED', mockExamDb[examId]?.status === 'APPROVED');

    // Test case 3: APPROVED -> PUBLISHED
    const resApprovedToPublished = await dispatchCommand({
        type: 'EXAM.TRANSITION_STATE',
        payload: { examId, fromState: 'APPROVED', toState: 'PUBLISHED' }
    });
    assertTest('EXAM_FSM', 'Transition APPROVED -> PUBLISHED succeeds for Admin', resApprovedToPublished.success === true, JSON.stringify(resApprovedToPublished.error));
    assertTest('EXAM_FSM', 'Exam state is now PUBLISHED', mockExamDb[examId]?.status === 'PUBLISHED');

    // Test case 4: PUBLISHED -> LOCKED
    const resPublishedToLocked = await dispatchCommand({
        type: 'EXAM.TRANSITION_STATE',
        payload: { examId, fromState: 'PUBLISHED', toState: 'LOCKED' }
    });
    assertTest('EXAM_FSM', 'Transition PUBLISHED -> LOCKED succeeds for Admin', resPublishedToLocked.success === true, JSON.stringify(resPublishedToLocked.error));
    assertTest('EXAM_FSM', 'Exam state is now LOCKED', mockExamDb[examId]?.status === 'LOCKED');

    // Test case 5: LOCKED -> ARCHIVED
    const resLockedToArchived = await dispatchCommand({
        type: 'EXAM.TRANSITION_STATE',
        payload: { examId, fromState: 'LOCKED', toState: 'ARCHIVED' }
    });
    assertTest('EXAM_FSM', 'Transition LOCKED -> ARCHIVED succeeds for Admin', resLockedToArchived.success === true, JSON.stringify(resLockedToArchived.error));
    assertTest('EXAM_FSM', 'Exam state is now ARCHIVED', mockExamDb[examId]?.status === 'ARCHIVED');

    // Test case 6: Invalid Transition (ARCHIVED -> DRAFT should fail)
    const resArchivedToDraft = await dispatchCommand({
        type: 'EXAM.TRANSITION_STATE',
        payload: { examId, fromState: 'ARCHIVED', toState: 'DRAFT' }
    });
    assertTest('EXAM_FSM', 'Transition ARCHIVED -> DRAFT fails immediately', resArchivedToDraft.success === false);

    // Test case 7: Invalid Transition (DRAFT -> APPROVED without REVIEW should fail)
    mockExamDb[examId].status = 'DRAFT';
    const resDraftToApproved = await dispatchCommand({
        type: 'EXAM.TRANSITION_STATE',
        payload: { examId, fromState: 'DRAFT', toState: 'APPROVED' }
    });
    assertTest('EXAM_FSM', 'Transition DRAFT -> APPROVED bypass fails immediately', resDraftToApproved.success === false);

    // Test case 8: Role Authorization (Unauthorized user role e.g. student tries to transition and fails)
    setMockIdentity({
        userId: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e3',
        role: 'student',
        email: 'student@sefaes.edu.ng'
    });
    const mockStudent = {
        id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e3',
        email: 'student@sefaes.edu.ng',
        app_metadata: { role: 'student' }
    };
    setMockAuthUser(mockStudent);
    mockExamDb[examId].status = 'DRAFT';
    const resStudentTransition = await dispatchCommand({
        type: 'EXAM.TRANSITION_STATE',
        payload: { examId, fromState: 'DRAFT', toState: 'REVIEW' }
    });
    assertTest('EXAM_FSM', 'Unauthorized student role cannot transition exam', resStudentTransition.success === false && resStudentTransition.error?.code === 'INSUFFICIENT_ROLE');

    // Test case 9: Direct worker bypass check (ensure grading writes flow through the FSM dispatch chain)
    // Let's set identity back to admin
    setMockIdentity({
        userId: mockAdmin.id,
        role: mockAdmin.app_metadata.role,
        email: mockAdmin.email
    });
    setMockAuthUser(mockAdmin);
    setMockRpcResult({ success: true });

    const jobId = 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0eb';
    const studentId = 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0ec';

    const resFinalize = await dispatchCommand({
        type: 'RESULT.FINALIZE_GRADING',
        payload: {
            jobId,
            studentId,
            examId,
            score: 95,
            feedback: 'Outstanding work!'
        }
    });
    assertTest('WORKER_BYPASS', 'RESULT.FINALIZE_GRADING executes successfully via FSM', resFinalize.success === true, JSON.stringify(resFinalize.error));

    const resFail = await dispatchCommand({
        type: 'RESULT.FAIL_GRADING',
        payload: {
            jobId,
            error: 'Failed to extract text'
        }
    });
    assertTest('WORKER_BYPASS', 'RESULT.FAIL_GRADING executes successfully via FSM', resFail.success === true, JSON.stringify(resFail.error));

    // 4. AUDIT COMPLETENESS CHECK
    console.log('\n--- TASK 6: AUDIT COMPLETENESS TEST ---');
    const auditLogs = getAuthAuditLog();
    const hasAuditRecords = auditLogs.length > 0;
    assertTest(
        'AUDIT',
        'Audit persistence successfully captures FSM execution history',
        hasAuditRecords,
        `Recorded ${auditLogs.length} audit entries.`
    );
}

// ── MAIN RUNNER ──────────────────────────────────────────────────────────────
async function main() {
    console.log('===============================================================');
    console.log('🛡️  SEFAES PRE-DAY 4 SYSTEM HARDENING AUDIT VERIFIER          ');
    console.log('===============================================================');

    // Static Verification
    verifyRegistry();
    verifyAuthorizationImmutability();
    verifyExecutorIsolation();
    verifyGatewayIntegrity();

    // Dynamic Flow Verification
    await runFsmFlowTests();

    console.log('\n===============================================================');
    const failedTests = testResults.filter(r => !r.passed);
    const passedTests = testResults.filter(r => r.passed);
    
    if (failedTests.length === 0) {
        console.log('✨ ALL AUDIT CHECKS PASSED! SYSTEM SECURE FOR DAY 4 EVOLUTION. ✨');
        console.log(`📊 Result: ${passedTests.length} / ${testResults.length} Checks Passed.`);
        console.log('===============================================================');
        process.exit(0);
    } else {
        console.error('❌ HARNESS DETECTED SECURITY OR STRUCTURAL DEVIATIONS!');
        console.error(`📊 Failures: ${failedTests.length} checks failed.`);
        failedTests.forEach(f => {
            console.error(`  - [${f.category}] ${f.description}: ${f.errorDetail || ''}`);
        });
        console.log('===============================================================');
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Audit run crashed:', err);
    process.exit(1);
});
