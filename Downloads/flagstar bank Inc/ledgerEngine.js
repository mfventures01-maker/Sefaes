/**
 * ================================================================
 * FLAGSTAR BANK — LEDGER ENGINE v7.0
 * Immutable Transaction Recording System
 * ================================================================
 * All financial actions must be recorded through this engine.
 * Ledger entries are immutable once recorded.
 * ================================================================
 */

const LedgerEngine = {
    /**
     * Transaction schema:
     * {
     *   id,
     *   accountNumber,
     *   type,          // credit | debit | transfer | fee | adjustment
     *   amount,
     *   fees,
     *   description,
     *   category,
     *   timestamp,
     *   _immutable: true
     * }
     */

    /**
     * Record a new transaction in the ledger
     * @param {Object} txnData - Transaction data
     * @returns {Object} The recorded transaction
     */
    record(txnData) {
        // Validate required fields
        const required = ['accountNumber', 'type', 'amount'];
        for (const field of required) {
            if (txnData[field] === undefined || txnData[field] === null) {
                SystemLogger.error('LedgerEngine', `Missing required field: ${field}`, 'Transaction not recorded', `Provide ${field} in transaction data`);
                return null;
            }
        }

        // Validate transaction type
        const validTypes = ['credit', 'debit', 'transfer', 'fee', 'adjustment'];
        if (!validTypes.includes(txnData.type)) {
            SystemLogger.error('LedgerEngine', `Invalid transaction type: ${txnData.type}`, 'Transaction rejected', `Use one of: ${validTypes.join(', ')}`);
            return null;
        }

        const transaction = {
            id: 'TXN-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4),
            accountNumber: txnData.accountNumber,
            type: txnData.type,
            amount: parseFloat(txnData.amount),
            fees: parseFloat(txnData.fees) || 0,
            description: txnData.description || '',
            category: txnData.category || 'Uncategorized',
            timestamp: txnData.timestamp || new Date().toISOString(),
            _immutable: true
        };

        // Persist to storage
        const db = StorageEngine.loadDB();
        db.transactions.push(transaction);
        StorageEngine.saveDB(db);

        // Log the event
        SystemLogger.log(
            'TRANSACTION_RECORDED',
            txnData.actor || 'SYSTEM',
            `${transaction.type} $${Math.abs(transaction.amount).toFixed(2)} on ${transaction.accountNumber} — ${transaction.description}`
        );

        return transaction;
    },

    /**
     * Get all transactions, optionally filtered
     * @param {Object} [filters] - Filter criteria
     * @returns {Array} Filtered transactions
     */
    getTransactions(filters = {}) {
        let txns = StorageEngine.getAll('transactions');

        if (filters.accountNumber) {
            txns = txns.filter(t => t.accountNumber === filters.accountNumber);
        }
        if (filters.type) {
            txns = txns.filter(t => t.type === filters.type);
        }
        if (filters.category) {
            txns = txns.filter(t => t.category === filters.category);
        }
        if (filters.search) {
            const s = filters.search.toLowerCase();
            txns = txns.filter(t =>
                t.description.toLowerCase().includes(s) ||
                t.category.toLowerCase().includes(s)
            );
        }
        if (filters.since) {
            const since = new Date(filters.since).getTime();
            txns = txns.filter(t => new Date(t.timestamp).getTime() >= since);
        }

        // Sort
        const sortKey = filters.sortKey || 'timestamp';
        const sortDir = filters.sortDir || 'desc';
        txns.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];
            if (sortKey === 'amount') {
                valA = Math.abs(valA);
                valB = Math.abs(valB);
            }
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return txns;
    },

    /**
     * Get a single transaction by ID
     * @param {string} id - Transaction ID
     * @returns {Object|null}
     */
    getById(id) {
        return StorageEngine.getById('transactions', id);
    },

    /**
     * Calculate fee breakdown for a transfer amount
     * @param {number} amount - Transfer amount
     * @returns {Object} Fee breakdown
     */
    calculateFees(amount) {
        const cot = amount * 0.02;      // 2% COT
        const tax = amount * 0.015;     // 1.5% TAX
        const irs = amount * 0.001;     // 0.1% IRS
        const totalFees = cot + tax + irs;
        const totalDebit = amount + totalFees;

        return {
            amount,
            cot: parseFloat(cot.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            irs: parseFloat(irs.toFixed(2)),
            totalFees: parseFloat(totalFees.toFixed(2)),
            totalDebit: parseFloat(totalDebit.toFixed(2))
        };
    },

    /**
     * Get ledger summary statistics
     * @returns {Object} Summary stats
     */
    getSummary() {
        const txns = this.getTransactions();
        const totalCredits = txns.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const totalDebits = txns.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalFees = txns.reduce((sum, t) => sum + (t.fees || 0), 0);

        return {
            totalTransactions: txns.length,
            totalCredits: parseFloat(totalCredits.toFixed(2)),
            totalDebits: parseFloat(totalDebits.toFixed(2)),
            totalFees: parseFloat(totalFees.toFixed(2)),
            netFlow: parseFloat((totalCredits - totalDebits).toFixed(2))
        };
    },

    /**
     * Export transactions as CSV
     * @param {Object} [filters] - Optional filters
     * @returns {string} CSV string
     */
    exportCSV(filters = {}) {
        const txns = this.getTransactions(filters);
        const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Fees'];
        const rows = txns.map(t => [
            t.timestamp.split('T')[0],
            `"${t.description}"`,
            t.category,
            t.type,
            t.amount.toFixed(2),
            (t.fees || 0).toFixed(2)
        ]);

        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    },

    /**
     * Verify ledger integrity
     * @returns {Object} Integrity report
     */
    verifyIntegrity() {
        const txns = StorageEngine.getAll('transactions');
        const issues = [];

        txns.forEach((t, i) => {
            if (!t.id) issues.push(`Transaction at index ${i} missing ID`);
            if (!t.accountNumber) issues.push(`Transaction ${t.id} missing accountNumber`);
            if (t.amount === undefined) issues.push(`Transaction ${t.id} missing amount`);
            if (!t.timestamp) issues.push(`Transaction ${t.id} missing timestamp`);
        });

        const report = {
            totalRecords: txns.length,
            issues: issues.length,
            details: issues,
            status: issues.length === 0 ? 'PASS' : 'FAIL'
        };

        SystemLogger.log(
            'LEDGER_INTEGRITY_CHECK',
            'SYSTEM',
            `Integrity check: ${report.status} (${report.totalRecords} records, ${report.issues} issues)`,
            report.issues > 0 ? 'WARN' : 'INFO'
        );

        return report;
    }
};
