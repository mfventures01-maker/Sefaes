// Mock Transactions Dataset for Dashboard Phase 2

export interface Transaction {
    id: string;
    tableId: string;
    totalAmount: number;
    paymentMethod: 'POS' | 'TRANSFER' | 'CASH';
    timestamp: string; // ISO string
    itemCount: number;
    staffId: string;
    status: 'paid' | 'pending';
}

export const mockTransactions: Transaction[] = [
    // Today's transactions
    {
        id: 'TXN-001',
        tableId: 'T1',
        totalAmount: 45000,
        paymentMethod: 'POS',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        itemCount: 3,
        staffId: 'staff_1',
        status: 'paid'
    },
    {
        id: 'TXN-002',
        tableId: 'T2',
        totalAmount: 28500,
        paymentMethod: 'TRANSFER',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        itemCount: 2,
        staffId: 'staff_2',
        status: 'paid'
    },
    {
        id: 'TXN-003',
        tableId: 'T4',
        totalAmount: 12000,
        paymentMethod: 'CASH',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        itemCount: 1,
        staffId: 'staff_1',
        status: 'paid'
    },
    {
        id: 'TXN-004',
        tableId: 'T1',
        totalAmount: 67500,
        paymentMethod: 'POS',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        itemCount: 4,
        staffId: 'staff_3',
        status: 'paid'
    },
    {
        id: 'TXN-005',
        tableId: 'T7',
        totalAmount: 95000,
        paymentMethod: 'TRANSFER',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        itemCount: 5,
        staffId: 'staff_2',
        status: 'paid'
    },
    {
        id: 'TXN-006',
        tableId: 'T2',
        totalAmount: 34000,
        paymentMethod: 'CASH',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        itemCount: 2,
        staffId: 'staff_1',
        status: 'paid'
    },
    {
        id: 'TXN-007',
        tableId: 'T4',
        totalAmount: 18500,
        paymentMethod: 'POS',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
        itemCount: 1,
        staffId: 'staff_3',
        status: 'pending'
    },
    {
        id: 'TXN-008',
        tableId: 'T1',
        totalAmount: 52000,
        paymentMethod: 'TRANSFER',
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        itemCount: 3,
        staffId: 'staff_2',
        status: 'paid'
    },
    {
        id: 'TXN-009',
        tableId: 'T7',
        totalAmount: 41000,
        paymentMethod: 'POS',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        itemCount: 2,
        staffId: 'staff_1',
        status: 'paid'
    },
    {
        id: 'TXN-010',
        tableId: 'T2',
        totalAmount: 23500,
        paymentMethod: 'CASH',
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        itemCount: 1,
        staffId: 'staff_3',
        status: 'paid'
    },
    {
        id: 'TXN-011',
        tableId: 'T4',
        totalAmount: 76000,
        paymentMethod: 'TRANSFER',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        itemCount: 4,
        staffId: 'staff_2',
        status: 'paid'
    },
    {
        id: 'TXN-012',
        tableId: 'T1',
        totalAmount: 15000,
        paymentMethod: 'CASH',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
        itemCount: 1,
        staffId: 'staff_1',
        status: 'pending'
    }
];

// Helper to get today's transactions
export const getTodayTransactions = (transactions: Transaction[] = mockTransactions): Transaction[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions.filter(txn => {
        const txnDate = new Date(txn.timestamp);
        return txnDate >= today;
    });
};

// Helper to filter by staff
export const getStaffTransactions = (staffId: string, transactions: Transaction[] = mockTransactions): Transaction[] => {
    return transactions.filter(txn => txn.staffId === staffId);
};

// Helper to calculate payment method breakdown
export const getPaymentMethodBreakdown = (transactions: Transaction[]) => {
    const breakdown = {
        POS: 0,
        TRANSFER: 0,
        CASH: 0
    };

    transactions.forEach(txn => {
        if (txn.status === 'paid') {
            breakdown[txn.paymentMethod] += txn.totalAmount;
        }
    });

    return breakdown;
};
