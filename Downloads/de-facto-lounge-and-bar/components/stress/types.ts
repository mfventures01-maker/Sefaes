
export type TransactionStatus = "INITIATED" | "PENDING" | "PAID" | "FAILED" | "CANCELLED";
export type PaymentMethod = "CASH" | "POS" | "TRANSFER";
export type VerificationSource = "MANUAL" | "CEO_OVERRIDE" | "POS_REFERENCE" | "BANK_MATCH";

export interface StressTransaction {
    id: string; // uuid
    order_id: string;
    created_at: string; // ISO
    verified_at: string | null; // ISO
    staff_id: string;
    staff_name: string;
    amount: number;
    payment_method: PaymentMethod;
    status: TransactionStatus;
    verification_source: VerificationSource;
    idempotency_key: string;
    meta: {
        tag: "STRESS_TEST";
        scenario_id: string;
        notes?: string;
    };
}

export type TestStatus = "IDLE" | "RUNNING" | "PASS" | "FAIL";

export interface TestResult {
    id: string; // T1, T2, etc.
    name: string;
    status: TestStatus;
    logs: string[];
    error?: string;
}

export interface StressTestScenario {
    id: string;
    name: string;
    description: string;
    run: (log: (msg: string) => void) => Promise<void>;
}
