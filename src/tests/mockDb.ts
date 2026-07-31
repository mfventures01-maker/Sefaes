// ────────────────────────────────────────────────────────────────────────────
// SEFAES CENTRAL MOCK DATABASE & SUPABASE STUBS
// Shared mock database state and client stubs for deterministic testing.
// ────────────────────────────────────────────────────────────────────────────

import { supabase, supabaseStubs } from '../lib/supabase';
import { db } from '../db/dbGateway';
import { CBTSessionStates } from '../engine/cbtSessionFSM';

export interface MockDbState {
    cbtSessions: Record<string, any>;
    cbtSnapshots: any[];
    cbtAttempts: Record<string, any>;
    cbtExams: Record<string, any>;
    students: Record<string, any>;
    results: Record<string, any>;
    auditLogs: any[];
    answerScripts?: Record<string, any>;
    gradingJobs?: Record<string, any>;
}

export const mockDb: MockDbState = {
    cbtSessions: {},
    cbtSnapshots: [],
    cbtAttempts: {},
    cbtExams: {},
    students: {},
    results: {},
    auditLogs: [],
    answerScripts: {},
    gradingJobs: {}
};
 
// Track currently logged in mock user
export let mockCurrentUser: any = null;

export function saveMockDb(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('sefaes_mock_db', JSON.stringify(mockDb));
    } catch (e) {
        console.error('Failed to save mockDb to localStorage:', e);
    }
}

export function loadMockDb(): void {
    if (typeof window === 'undefined') return;
    try {
        const stored = localStorage.getItem('sefaes_mock_db');
        if (stored) {
            const parsed = JSON.parse(stored);
            Object.assign(mockDb, parsed);
        }
    } catch (e) {
        console.error('Failed to load mockDb from localStorage:', e);
    }
}

// ── Mock v4 UUID Generator ─────────────────────────────────────────────────
export function generateMockUUID(): string {
    const hex = '0123456789abcdef';
    const gen = (len: number) => Array.from({ length: len }, () => hex[Math.floor(Math.random() * 16)]).join('');
    return `${gen(8)}-${gen(4)}-4${gen(3)}-8${gen(3)}-${gen(12)}`;
}

export function resetMockDb(): void {
    mockCurrentUser = null;
    mockDb.cbtSessions = {};
    mockDb.cbtSnapshots = [];
    mockDb.cbtAttempts = {};
    mockDb.cbtExams = {
        'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0a0': { id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0a0', duration_minutes: 60, exam_title: 'Midterm Math', class_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0c1', school_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0f1' },
        '98b50e2d-dc99-43ef-b387-052637738f61': { id: '98b50e2d-dc99-43ef-b387-052637738f61', duration_minutes: 60, exam_title: 'English Assessment', class_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0c1', school_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0f1' }
    };
    mockDb.students = {};
    mockDb.results = {};
    mockDb.auditLogs = [];
    mockDb.answerScripts = {};
    mockDb.gradingJobs = {};
    saveMockDb();
}

export function setupSupabaseStubs(): void {
    console.log("=== setupSupabaseStubs called ===");
    if (supabaseStubs) {
        for (const key of Object.keys(supabaseStubs)) {
            delete supabaseStubs[key];
        }
        for (const sym of Object.getOwnPropertySymbols(supabaseStubs)) {
            delete supabaseStubs[sym];
        }
    }
    if (typeof window !== 'undefined' && localStorage.getItem('sefaes_mock_db')) {
        loadMockDb();
    } else {
        resetMockDb();
    }
    try {
        const stored = localStorage.getItem('sefaes_mock_user');
        if (stored) {
            mockCurrentUser = JSON.parse(stored);
        }
    } catch (e) {}

    Object.defineProperty(supabase, 'auth', {
        value: {
            signInWithPassword: async (credentials: any) => {
                const isAdminSchool = credentials.email === 'admin@school.com' && credentials.password === 'password123';
                const isPriya = credentials.email === 'priyaagwash@gmail.com' && credentials.password === 'Branama147';
                if (isAdminSchool || isPriya) {
                    const user = {
                        id: isPriya ? 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e1' : 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e0',
                        email: credentials.email,
                        app_metadata: { role: 'admin' }
                    };
                    mockCurrentUser = user;
                    try {
                        localStorage.setItem('sefaes_mock_user', JSON.stringify(user));
                    } catch (e) {}
                    return {
                        data: {
                            user,
                            session: { access_token: 'mock-access-token' }
                        },
                        error: null
                    };
                }
                return { data: { user: null, session: null }, error: new Error('Invalid login credentials') };
            },
            signUp: async (credentials: any) => {
                const user = {
                    id: generateMockUUID(),
                    email: credentials.email,
                    confirmed_at: new Date().toISOString()
                };
                mockCurrentUser = user;
                try {
                    localStorage.setItem('sefaes_mock_user', JSON.stringify(user));
                } catch (e) {}
                return {
                    data: { user },
                    error: null
                };
            },
            signOut: async () => {
                mockCurrentUser = null;
                try {
                    localStorage.removeItem('sefaes_mock_user');
                    localStorage.removeItem('sefaes_mock_db');
                } catch (e) {}
                resetMockDb();
                return { error: null };
            },
            getUser: async () => {
                return { data: { user: mockCurrentUser }, error: null };
            },
            getSession: async () => {
                return {
                    data: {
                        session: mockCurrentUser ? {
                            user: mockCurrentUser,
                            access_token: 'mock-access-token',
                            expires_at: Math.floor(Date.now() / 1000) + 3600
                        } : null
                    },
                    error: null
                };
            }
        },
        configurable: true,
        writable: true
    });

    Object.defineProperty(supabase, 'from', {
        value: (table: string) => {
            const chain: any = {
                select: (columns: string, options?: any) => {
                    return chain;
                },
                eq: (colName: string, val: any) => {
                    if (table === 'cbt_sessions') {
                        const session = mockDb.cbtSessions[val] || Object.values(mockDb.cbtSessions).find((s: any) => s[colName] === val);
                        chain.currentData = session || null;
                        chain.eq = (secondCol: string, secondVal: any) => {
                            const s = Object.values(mockDb.cbtSessions).find(
                                (s: any) => s[colName] === val && s[secondCol] === secondVal
                            );
                            chain.currentData = s || null;
                            return chain;
                        };
                    } else if (table === 'cbt_exams') {
                        const exam = mockDb.cbtExams[val];
                        chain.currentData = exam || null;
                    } else if (table === 'cbt_attempts') {
                        const attempt = mockDb.cbtAttempts[val] || Object.values(mockDb.cbtAttempts).find((a: any) => a[colName] === val);
                        chain.currentData = attempt || null;
                        chain.eq = (secondCol: string, secondVal: any) => {
                            const a = Object.values(mockDb.cbtAttempts).find(
                                (a: any) => a[colName] === val && a[secondCol] === secondVal
                            );
                            chain.currentData = a || null;
                            return chain;
                        };
                    } else if (table === 'exams') {
                        const filtered = Object.values(mockDb.cbtExams).filter((e: any) => e[colName] === val);
                        chain.currentData = filtered;
                    } else if (table === 'answer_scripts') {
                        const filtered = Object.values(mockDb.answerScripts || {}).filter((e: any) => e[colName] === val);
                        chain.currentData = filtered;
                    } else if (table === 'profiles') {
                        const profile = {
    id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0b1',
    user_id: val,
    institution_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0ee',
    role: 'admin',
    full_name: 'Priya Agwash',
    institutions: {
        name: 'Greenwood High',
        type: 'secondary_school'
    }
};
                        chain.currentData = profile;
                    }
                    return chain;
                },
                in: (colName: string, vals: any[]) => {
                    if (table === 'cbt_sessions') {
                        const matched = Object.values(mockDb.cbtSessions).filter((s: any) => vals.includes(s.state));
                        chain.currentData = matched;
                    } else if (table === 'grading_jobs') {
                        const matched = Object.values(mockDb.gradingJobs || {}).filter((s: any) => vals.includes(s[colName]));
                        chain.currentData = matched;
                    }
                    return chain;
                },
                order: (colName: string, options?: any) => {
                    if (table === 'cbt_snapshots' || table === 'cbt_session_snapshots') {
                        const sorted = [...mockDb.cbtSnapshots].sort((a, b) => b.created_at.localeCompare(a.created_at));
                        chain.currentData = sorted;
                    }
                    return chain;
                },
                limit: (lim: number) => {
                    if (Array.isArray(chain.currentData)) {
                        chain.currentData = chain.currentData.slice(0, lim);
                    }
                    return chain;
                },
                single: async () => {
                    return { data: chain.currentData, error: chain.currentData ? null : new Error('Not found') };
                },
                then: (cb: any) => {
                    return Promise.resolve(cb({ data: chain.currentData, error: null }));
                },
                upsert: (values: any, options?: any) => {
                    const id = values.id || generateMockUUID();
                    if (table === 'cbt_sessions') {
                        const existing = Object.values(mockDb.cbtSessions).find(
                            (s: any) => s.exam_id === values.exam_id && s.student_id === values.student_id
                        );
                        const finalRecord = {
                            id: existing?.id || id,
                            ...values,
                            created_at: existing?.created_at || new Date().toISOString()
                        };
                        mockDb.cbtSessions[finalRecord.id] = finalRecord;
                        chain.currentData = finalRecord;
                    } else if (table === 'cbt_attempts') {
                        const existing = Object.values(mockDb.cbtAttempts).find(
                            (a: any) => a.exam_id === values.exam_id && a.student_id === values.student_id
                        );
                        const finalRecord = {
                            id: existing?.id || id,
                            ...values,
                            created_at: existing?.created_at || new Date().toISOString()
                        };
                        mockDb.cbtAttempts[finalRecord.id] = finalRecord;
                        chain.currentData = finalRecord;
                    } else if (table === 'students') {
                        mockDb.students[id] = { id, ...values };
                        chain.currentData = mockDb.students[id];
                    } else if (table === 'results') {
                        mockDb.results[id] = { id, ...values };
                        chain.currentData = mockDb.results[id];
                    } else if (table === 'exams') {
                        const normalized: any = {};
                        for (const key of Object.keys(values)) {
                            const newKey = key.startsWith('p_') ? key.substring(2) : key;
                            normalized[newKey] = values[key];
                        }
                        mockDb.cbtExams[id] = { id, ...normalized };
                        chain.currentData = mockDb.cbtExams[id];
                    } else {
                        chain.currentData = values;
                    }
                    saveMockDb();
                    return {
                        select: () => ({
                            single: async () => ({ data: chain.currentData, error: null })
                        })
                    };
                },
                update: (values: any) => {
                    return {
                        eq: (colName: string, val: any) => {
                            if (table === 'cbt_sessions') {
                                const session = mockDb.cbtSessions[val];
                                if (session) {
                                    Object.assign(session, values);
                                }
                            }
                            saveMockDb();
                            return Promise.resolve({ error: null });
                        }
                    };
                },
                insert: (values: any) => {
                    if (table === 'cbt_session_snapshots') {
                        const record = {
                            id: generateMockUUID(),
                            ...values,
                            created_at: new Date().toISOString()
                        };
                        mockDb.cbtSnapshots.push(record);
                    } else if (table === 'audit_logs') {
                        mockDb.auditLogs.push(values);
                    }
                    saveMockDb();
                    return Promise.resolve({ error: null });
                }
            };

            // Initialize default return values for table queries
            if (table === 'profiles') {
               chain.currentData = {
    id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0b1',
    user_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e1',
    institution_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0ee',
    role: 'admin',
    full_name: 'Priya Agwash',
    institutions: {
        name: 'Greenwood High',
        type: 'secondary_school'
    }
};
            } else if (table === 'schools') {
                chain.currentData = [
                    { id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0f1', name: 'Greenwood High', institution_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0ee' }
                ];
            } else if (table === 'classes') {
                chain.currentData = [
                    { id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0c1', name: 'JSS 1', school_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0f1' },
                    { id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0c2', name: 'JSS 2', school_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0f1' }
                ];
            } else if (table === 'teachers') {
                chain.currentData = [
                    { id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0d1', name: 'Teacher John', school_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0f1' }
                ];
            } else if (table === 'students') {
                const dynamicStudents = Object.values(mockDb.students);
                if (dynamicStudents.length > 0) {
                    chain.currentData = dynamicStudents;
                } else {
                    chain.currentData = [
                        { id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e2', first_name: 'Jane', last_name: 'Doe', student_number: 'STU001', class_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0c1' },
                        { id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e3', first_name: 'John', last_name: 'Smith', student_number: 'STU002', class_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0c1' }
                    ];
                }
            } else if (table === 'subject_catalog') {
                chain.currentData = [
                    { id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e4', name: 'Mathematics', category: 'Sciences' },
                    { id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e5', name: 'English', category: 'Arts' }
                ];
            } else if (table === 'class_subjects') {
                chain.currentData = [
                    {
                        id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e6',
                        class_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0c1',
                        subject_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e4',
                        school_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0f1',
                        classes: { name: 'JSS 1', school_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0f1' },
                        subject_catalog: { name: 'Mathematics' }
                    }
                ];
            } else if (table === 'exams') {
                const dynamicExams = Object.values(mockDb.cbtExams);
                if (dynamicExams.length > 0) {
                    chain.currentData = dynamicExams;
                } else {
                    chain.currentData = [
                        { id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0a1', exam_title: 'Midterm Math', class_subject_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e6', status: 'DRAFT', total_marks: 100 }
                    ];
                }
            } else if (table === 'results' || table === 'grading_results') {
                chain.currentData = Object.values(mockDb.results);
            } else if (table === 'answer_scripts') {
                const pendingJobs = Object.values(mockDb.gradingJobs || {}).filter((job: any) => job.status === 'pending');
                if (pendingJobs.length > 0) {
                    for (const job of pendingJobs) {
                        job.status = 'completed';
                        const scriptId = job.script_id;
                        if (mockDb.answerScripts && mockDb.answerScripts[scriptId]) {
                            const script = mockDb.answerScripts[scriptId];
                            script.grading_status = 'graded';
                            
                            const resultId = generateMockUUID();
                            const student = mockDb.students[script.student_id] || { first_name: 'Jane', last_name: 'Doe' };
                            const exam = mockDb.cbtExams[script.exam_id] || { exam_title: 'Math Exam' };
                            
                            mockDb.results[resultId] = {
                                id: resultId,
                                score: 88,
                                ai_feedback: 'Well constructed proof.',
                                confidence: 0.95,
                                answer_script_id: scriptId,
                                answer_scripts: {
                                    id: scriptId,
                                    student_id: script.student_id,
                                    exam_id: script.exam_id,
                                    students: {
                                        id: script.student_id,
                                        first_name: student.first_name,
                                        last_name: student.last_name,
                                        class_id: student.class_id,
                                        classes: { school_id: script.school_id }
                                    },
                                    exams: {
                                        id: script.exam_id,
                                        exam_title: exam.exam_title,
                                        class_id: exam.class_id
                                    }
                                }
                            };
                        }
                    }
                    saveMockDb();
                }
                chain.currentData = Object.values(mockDb.answerScripts || {});
            } else if (table === 'grading_jobs') {
                const pendingJobs = Object.values(mockDb.gradingJobs || {}).filter((job: any) => job.status === 'pending');
                if (pendingJobs.length > 0) {
                    for (const job of pendingJobs) {
                        job.status = 'completed';
                        const scriptId = job.script_id;
                        if (mockDb.answerScripts && mockDb.answerScripts[scriptId]) {
                            const script = mockDb.answerScripts[scriptId];
                            script.grading_status = 'graded';
                            
                            const resultId = generateMockUUID();
                            const student = mockDb.students[script.student_id] || { first_name: 'Jane', last_name: 'Doe' };
                            const exam = mockDb.cbtExams[script.exam_id] || { exam_title: 'Math Exam' };
                            
                            mockDb.results[resultId] = {
                                id: resultId,
                                score: 88,
                                ai_feedback: 'Well constructed proof.',
                                confidence: 0.95,
                                answer_script_id: scriptId,
                                answer_scripts: {
                                    id: scriptId,
                                    student_id: script.student_id,
                                    exam_id: script.exam_id,
                                    students: {
                                        id: script.student_id,
                                        first_name: student.first_name,
                                        last_name: student.last_name,
                                        class_id: student.class_id,
                                        classes: { school_id: script.school_id }
                                    },
                                    exams: {
                                        id: script.exam_id,
                                        exam_title: exam.exam_title,
                                        class_id: exam.class_id
                                    }
                                }
                            };
                        }
                    }
                    saveMockDb();
                }
                chain.currentData = Object.values(mockDb.gradingJobs || {});
            } else {
                chain.currentData = [];
            }

            return chain;
        },
        configurable: true,
        writable: true
    });

    Object.defineProperty(supabase, 'storage', {
        value: {
            from: (bucket: string) => {
                return {
                    upload: async (path: string, file: any) => {
                        return { data: { path }, error: null };
                    },
                    getPublicUrl: (path: string) => {
                        return { data: { publicUrl: `https://mock-storage.supabase.co/${bucket}/${path}` } };
                    }
                };
            }
        },
        configurable: true,
        writable: true
    });

    Object.defineProperty(supabase, 'functions', {
        value: {
            invoke: async (name: string, options?: any) => {
                if (name === 'grade-script') {
                    if (mockDb.gradingJobs) {
                        for (const job of Object.values(mockDb.gradingJobs)) {
                            if (job.status === 'pending') {
                                job.status = 'completed';
                                const scriptId = job.script_id;
                                if (mockDb.answerScripts && mockDb.answerScripts[scriptId]) {
                                    const script = mockDb.answerScripts[scriptId];
                                    script.grading_status = 'graded';
                                    
                                    const resultId = generateMockUUID();
                                    const student = mockDb.students[script.student_id] || { first_name: 'Jane', last_name: 'Doe' };
                                    const exam = mockDb.cbtExams[script.exam_id] || { exam_title: 'Math Exam' };
                                    
                                    mockDb.results[resultId] = {
                                        id: resultId,
                                        score: 88,
                                        ai_feedback: 'Well constructed proof.',
                                        confidence: 0.95,
                                        answer_script_id: scriptId,
                                        answer_scripts: {
                                            id: scriptId,
                                            student_id: script.student_id,
                                            exam_id: script.exam_id,
                                            students: {
                                                id: script.student_id,
                                                first_name: student.first_name,
                                                last_name: student.last_name,
                                                class_id: student.class_id,
                                                classes: { school_id: script.school_id }
                                            },
                                            exams: {
                                                id: script.exam_id,
                                                exam_title: exam.exam_title,
                                                class_id: exam.class_id
                                            }
                                        }
                                    };
                                }
                            }
                        }
                        saveMockDb();
                    }
                    return { data: { success: true, message: 'Grading complete' }, error: null };
                }
                return { data: { success: true, message: `Edge function ${name} invoked successfully` }, error: null };
            }
        },
        configurable: true,
        writable: true
    });

    // Unified mock RPC handler
    const handleMockRpc = async (name: string, payload: any = {}): Promise<{ data: any; error: any }> => {
        if (name === 'resolve_teacher_identity') {
            return {
                data: {
                    teacher_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0d1',
                    school_id: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0f1',
                    teacher_name: 'Priya Agwash',
                    teacher_email: 'priyaagwash@gmail.com'
                },
                error: null
            };
        }
        if (name === 'transition_cbt_session') {
            const { p_session_id, p_to_state } = payload;
            const session = mockDb.cbtSessions[p_session_id];
            if (!session) {
                return { data: null, error: { message: 'SESSION_NOT_FOUND' } };
            }
            if (session.state === 'SUBMITTED') {
                return { data: null, error: { message: 'SESSION_LOCKED' } };
            }
            const from = session.state;
            session.state = p_to_state;
            saveMockDb();
            return { data: { success: true, from, to: p_to_state }, error: null };
        }
        if (name === 'upsert_cbt_answer') {
            return { data: { success: true }, error: null };
        }
        if (name === 'submit_cbt_exam') {
            const { p_attempt_id } = payload;
            const attempt = mockDb.cbtAttempts[p_attempt_id];
            if (attempt) {
                attempt.status = 'submitted';
                attempt.score = 85;
                attempt.end_time = new Date().toISOString();
            }
            saveMockDb();
            return { data: { success: true, score: 85 }, error: null };
        }
        if (name === 'finalize_grading') {
            const { p_script_id, p_score, p_feedback } = payload;
            mockDb.results[p_script_id] = {
                id: p_script_id,
                score: p_score,
                feedback: p_feedback,
                finalized: true
            };
            saveMockDb();
            return { data: { success: true }, error: null };
        }
        if (name === 'update_user_role') {
            return { data: { success: true }, error: null };
        }
        if (name === 'enroll_student') {
            const id = generateMockUUID();
            mockDb.students[id] = {
                id,
                first_name: payload.p_first_name,
                last_name: payload.p_last_name,
                gender: payload.p_gender,
                student_number: payload.p_student_number,
                class_id: payload.p_class_id,
                school_id: payload.p_school_id,
                date_of_birth: payload.p_date_of_birth
            };
            saveMockDb();
            return { data: { success: true, student_id: id, student_number: payload.p_student_number }, error: null };
        }
        if (name === 'bulk_enroll_students') {
            const count = payload.p_students?.length || 0;
            if (payload.p_students) {
                payload.p_students.forEach((s: any) => {
                    const id = generateMockUUID();
                    mockDb.students[id] = {
                        id,
                        first_name: s.first_name,
                        last_name: s.last_name,
                        gender: s.gender,
                        student_number: s.student_number,
                        class_id: s.class_id,
                        school_id: payload.p_school_id
                    };
                });
            }
            saveMockDb();
            return { data: { enrolled_count: count }, error: null };
        }
        if (name === 'enroll_student_subjects') {
            return { data: { success: true, student_id: payload.p_student_id, assigned_count: 5 }, error: null };
        }
        if (name === 'create_exam') {
            const examId = payload.p_exam_id || generateMockUUID();
            mockDb.cbtExams[examId] = {
                id: examId,
                exam_title: payload.p_exam_title,
                class_id: payload.p_class_id,
                subject_id: payload.p_subject_id,
                exam_date: payload.p_exam_date,
                marking_scheme: payload.p_marking_scheme,
                school_id: payload.p_school_id
            };
            saveMockDb();
            return { data: { success: true, examId }, error: null };
        }
        if (name === 'create_answer_script') {
            const scriptId = generateMockUUID();
            const jobId = generateMockUUID();
            
            mockDb.answerScripts = mockDb.answerScripts || {};
            mockDb.answerScripts[scriptId] = {
                id: scriptId,
                student_id: payload.p_student_id,
                exam_id: payload.p_exam_id,
                teacher_id: payload.p_teacher_id,
                school_id: payload.p_school_id,
                ocr_text: payload.p_ocr_text,
                file_url: payload.p_file_url,
                grading_status: 'pending',
                created_at: new Date().toISOString()
            };

            mockDb.gradingJobs = mockDb.gradingJobs || {};
            mockDb.gradingJobs[jobId] = {
                id: jobId,
                script_id: scriptId,
                status: 'pending',
                attempts: 0,
                processed_at: null,
                created_at: new Date().toISOString()
            };
            
            saveMockDb();
            return { data: { script_id: scriptId, status: 'pending' }, error: null };
        }
        return { data: null, error: { message: `RPC_NOT_MOCKED: ${name}` } };
    };

    Object.defineProperty(supabase, 'rpc', {
        value: async (name: string, payload?: any) => {
            return handleMockRpc(name, payload);
        },
        configurable: true,
        writable: true
    });

    db.rpc = async (name: string, payload?: any): Promise<any> => {
        const { data, error } = await handleMockRpc(name, payload);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    };
}
