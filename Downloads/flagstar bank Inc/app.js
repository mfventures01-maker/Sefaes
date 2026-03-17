/**
 * ================================================================
 * FLAGSTAR BANK — APPLICATION BOOTSTRAP v7.0
 * Main Entry Point — Module Initialization & Wiring
 * ================================================================
 * This file initializes all modules and wires them together.
 * Load order: Logger → Storage → Ledger → Security → StateMachine → UIEngine → Router → App
 * ================================================================
 */

// ================================================================
// AUTH STATE MANAGEMENT (Refactored to use StorageEngine)
// ================================================================
const AuthState = {
    isLoggedIn: false,
    user: null,
    role: 'guest',

    init() {
        const session = StorageEngine.getSession();
        if (session) {
            this.isLoggedIn = true;
            this.user = session;
            this.role = session.role || 'member';
        }
        return this.isLoggedIn;
    },

    login(user) {
        const sessionData = {
            ...user,
            _loginTime: new Date().toISOString()
        };

        this.isLoggedIn = true;
        this.user = sessionData;
        this.role = user.role || 'member';
        StorageEngine.setSession(sessionData);

        SystemLogger.log('USER_LOGIN', user.id || 'UNKNOWN', `User ${user.name} logged in as ${user.role}`);

        // Navigate to dashboard via state machine
        StateMachine.transition('AUTH_DASHBOARD');
        window.location.hash = '#/';
    },

    logout() {
        const userId = this.user ? this.user.id : 'UNKNOWN';
        SystemLogger.log('USER_LOGOUT', userId, 'User logged out.');

        this.isLoggedIn = false;
        this.user = null;
        this.role = 'guest';
        StorageEngine.clearSession();

        // Clear funnel data
        StateMachine.clearFunnelData('transfer');
        SecurityEngine.resetVerification();

        window.location.hash = '#/login';
    }
};

// ================================================================
// ROUTER (Refactored — Only dispatches to State Machine)
// ================================================================
const Router = {
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const path = hash.split('?')[0];

        // Sync auth state
        AuthState.init();

        // Resolve state from route
        const state = StateMachine.resolveRoute(path);
        if (state) {
            StateMachine.transition(state);
        } else {
            StateMachine.transition('ERROR_404');
        }
    },

    navigate(path) {
        window.location.hash = path;
    }
};

// ================================================================
// APP CONTROLLER (Business Logic)
// ================================================================
const App = {
    currentSort: { key: 'timestamp', dir: 'desc' },

    /**
     * Render transactions into the accounts page table
     * @param {Array} txns - Filtered transaction array
     */
    renderTransactions(txns) {
        const tbody = document.getElementById('txn-list-body');
        if (!tbody) return;

        tbody.innerHTML = txns.map(t => {
            const date = t.timestamp ? t.timestamp.split('T')[0] : t.date || '';
            const desc = t.description || t.desc || '';
            const cat = t.category || t.cat || '';
            const amount = t.amount || 0;
            return `
                <tr>
                    <td>${date}</td>
                    <td>${desc}</td>
                    <td>${cat}</td>
                    <td style="color: ${amount < 0 ? 'var(--flagstar-red)' : 'var(--emerald)'}; font-weight: 600;">
                        ${amount < 0 ? '-' : '+'}$${Math.abs(amount).toFixed(2)}
                    </td>
                </tr>
            `;
        }).join('');
    },

    sortTransactions(key) {
        if (this.currentSort.key === key) {
            this.currentSort.dir = this.currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.key = key;
            this.currentSort.dir = 'asc';
        }

        // Update UI sort arrows
        ['date', 'desc', 'cat', 'amount'].forEach(k => {
            const el = document.getElementById('sort-' + k);
            if (el) el.innerText = '';
        });

        // Map display keys to storage keys
        const keyMap = { date: 'timestamp', desc: 'description', cat: 'category', amount: 'amount' };
        this.currentSort.key = keyMap[key] || key;

        const currentEl = document.getElementById('sort-' + key);
        if (currentEl) {
            currentEl.innerText = this.currentSort.dir === 'asc' ? '▲' : '▼';
        }

        this.applyFilters();
    },

    applyFilters() {
        const searchEl = document.getElementById('txn-search');
        const catEl = document.getElementById('txn-filter-cat');
        if (!searchEl || !catEl) return;

        const search = searchEl.value.toLowerCase();
        const cat = catEl.value;

        const txns = LedgerEngine.getTransactions({
            search: search || undefined,
            category: cat !== 'all' ? cat : undefined,
            sortKey: this.currentSort.key,
            sortDir: this.currentSort.dir
        });

        this.renderTransactions(txns);
    },

    // --- Registration Funnel ---
    handleRegStep3() {
        const bar = document.getElementById('reg-upload-bar');
        const container = document.getElementById('reg-upload-progress');
        if (!container || !bar) return;

        container.style.display = 'block';
        let progress = 0;

        const interval = setInterval(() => {
            progress += 10;
            bar.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(interval);
                SystemLogger.log('REGISTRATION', 'USER', 'Documents uploaded. Proceeding to confirmation.');
                Router.navigate('/register/step4');
            }
        }, 200);
    },

    // --- Loan Funnel ---
    handleLoanType(type) {
        StateMachine.setFunnelData('loan', { type });
        SystemLogger.log('LOAN_TYPE_SELECTED', 'USER', `Selected loan type: ${type}`);
        Router.navigate('/loans/step2');
    },

    handleLoanDecision() {
        Router.navigate('/loans/step5');
    },

    // --- Transfer Funnel ---
    handleTransferComplete() {
        const cotInput = document.getElementById('cot-code');
        if (!cotInput) return;

        const code = cotInput.value.trim();
        const session = StorageEngine.getSession();
        const accountId = session ? session.id : '';

        const result = SecurityEngine.validateCOT(code, accountId);

        if (result.valid) {
            // Check transfer amount to determine if TAX/IRS needed
            const transferData = StateMachine.getFunnelData('transfer');
            const amount = transferData.amount || 0;
            const authResult = SecurityEngine.authorizeTransfer(amount);

            if (authResult.authorized) {
                // Record the transaction in the ledger
                LedgerEngine.record({
                    accountNumber: transferData.fromAccount || '••••1234',
                    type: 'transfer',
                    amount: -(amount),
                    fees: transferData.fees || 0,
                    description: transferData.description || 'Wire Transfer',
                    category: 'Transfer',
                    actor: session ? session.name : 'USER'
                });

                UIEngine.toast('Transfer authorized and completed!', 'success');
                Router.navigate('/transfer/step4');
            } else if (authResult.nextStep === 'TAX') {
                UIEngine.toast('TAX verification required for this amount.', 'warning');
                Router.navigate('/transfer/verify-tax');
            } else if (authResult.nextStep === 'IRS') {
                UIEngine.toast('IRS verification required for this amount.', 'warning');
                Router.navigate('/transfer/verify-irs');
            }
        } else {
            UIEngine.toast(result.reason, 'error');
        }
    },

    handleTaxVerification() {
        const taxInput = document.getElementById('tax-code');
        if (!taxInput) return;

        const code = taxInput.value.trim();
        const session = StorageEngine.getSession();
        const result = SecurityEngine.validateTAX(code, session ? session.id : '');

        if (result.valid) {
            const transferData = StateMachine.getFunnelData('transfer');
            const amount = transferData.amount || 0;
            const authResult = SecurityEngine.authorizeTransfer(amount);

            if (authResult.authorized) {
                LedgerEngine.record({
                    accountNumber: transferData.fromAccount || '••••1234',
                    type: 'transfer',
                    amount: -(amount),
                    fees: transferData.fees || 0,
                    description: transferData.description || 'Wire Transfer',
                    category: 'Transfer',
                    actor: session ? session.name : 'USER'
                });

                UIEngine.toast('Transfer completed!', 'success');
                Router.navigate('/transfer/step4');
            } else if (authResult.nextStep === 'IRS') {
                UIEngine.toast('IRS verification required.', 'warning');
                Router.navigate('/transfer/verify-irs');
            }
        } else {
            UIEngine.toast(result.reason, 'error');
        }
    },

    handleIrsVerification() {
        const irsInput = document.getElementById('irs-code');
        if (!irsInput) return;

        const code = irsInput.value.trim();
        const session = StorageEngine.getSession();
        const result = SecurityEngine.validateIRS(code, session ? session.id : '');

        if (result.valid) {
            const transferData = StateMachine.getFunnelData('transfer');

            LedgerEngine.record({
                accountNumber: transferData.fromAccount || '••••1234',
                type: 'transfer',
                amount: -(transferData.amount || 0),
                fees: transferData.fees || 0,
                description: transferData.description || 'Wire Transfer',
                category: 'Transfer',
                actor: session ? session.name : 'USER'
            });

            UIEngine.toast('All verifications complete! Transfer processed.', 'success');
            Router.navigate('/transfer/step4');
        } else {
            UIEngine.toast(result.reason, 'error');
        }
    },

    // --- Admin Methods ---
    handleAdminAccountCreation(e) {
        if (e) e.preventDefault();

        const loader = UIEngine.createLoader('admin-account-loader', {
            duration: 3000,
            message: 'Initializing secure vault and generating transfer codes...',
            completeMessage: 'Account created successfully! Credentials sent to customer.',
            onComplete: () => {
                SystemLogger.log('ADMIN_ACTION', 'ADMIN', 'New customer account created.');
                UIEngine.toast('Account created successfully!', 'success');
                setTimeout(() => Router.navigate('/admin'), 2000);
            }
        });
        if (loader) loader.start();
    },

    handleBatchCodeGeneration() {
        const loader = UIEngine.createLoader('admin-batch-loader', {
            duration: 2500,
            message: 'Generating unique COT/TAX/IRS codes for selected accounts...',
            completeMessage: 'Batch generation complete. 32 codes updated.',
            onComplete: () => {
                SystemLogger.log('ADMIN_ACTION', 'ADMIN', 'Batch code generation completed.');
                UIEngine.toast('32 codes generated!', 'success');
            }
        });
        if (loader) loader.start();
    },

    kycZoom: 1,
    handleKYCZoom(delta) {
        this.kycZoom = Math.max(1, Math.min(3, this.kycZoom + delta));
        const img = document.getElementById('kyc-passport-img');
        if (img) img.style.transform = `scale(${this.kycZoom})`;
    },

    downloadSource() {
        const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flagstar-bank-v7.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    downloadStatement() {
        const csv = LedgerEngine.exportCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flagstar-statement.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        UIEngine.toast('Statement downloaded.', 'success');
    }
};

// ================================================================
// EVENT WIRING — Attach events after each state transition
// ================================================================
function attachEventsForState(state) {
    UIEngine._closeMobileNav();

    if (state === 'PUBLIC_LOGIN') {
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('login-id').value;
                const pass = document.getElementById('login-pass').value;

                if (id && pass) {
                    const user = SecurityEngine.verifyCredentials(id, pass);
                    if (user) {
                        AuthState.login(user);
                    } else {
                        UIEngine.toast('Invalid credentials. Please try again.', 'error');
                    }
                } else {
                    UIEngine.toast('Email and Password are required.', 'warning');
                }
            });
        }
    }

    if (state === 'REG_STEP_1') {
        const form = document.getElementById('reg-step1-form');
        if (form) form.addEventListener('submit', (e) => {
            e.preventDefault();
            StateMachine.setFunnelData('registration', {
                firstName: document.getElementById('reg-fname').value,
                lastName: document.getElementById('reg-lname').value,
                email: document.getElementById('reg-email').value,
                phone: document.getElementById('reg-phone').value
            });
            SystemLogger.log('REGISTRATION', 'USER', 'Step 1 completed — personal data submitted.');
            Router.navigate('/register/step2');
        });
    }

    if (state === 'REG_STEP_2') {
        const form = document.getElementById('reg-step2-form');
        if (form) form.addEventListener('submit', (e) => {
            e.preventDefault();
            StateMachine.setFunnelData('registration', {
                idType: document.getElementById('reg-id-type').value,
                idNumber: document.getElementById('reg-id-num').value
            });
            SystemLogger.log('REGISTRATION', 'USER', 'Step 2 completed — KYC data submitted.');
            Router.navigate('/register/step3');
        });
    }

    if (state === 'REG_STEP_3') {
        document.querySelectorAll('.doc-upload').forEach(input => {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                const target = e.target.dataset.target;
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const preview = document.getElementById(target);
                        if (preview) {
                            preview.innerText = '';
                            preview.style.backgroundImage = `url(${ev.target.result})`;
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    if (state === 'AUTH_DASHBOARD') {
        const skeleton = document.getElementById('txn-skeleton');
        const content = document.getElementById('txn-content');
        if (skeleton && content) {
            skeleton.style.display = 'block';
            content.style.display = 'none';
            setTimeout(() => {
                skeleton.style.display = 'none';
                content.style.display = 'block';
            }, 1200);
        }
    }

    if (state === 'AUTH_ACCOUNTS') {
        App.applyFilters();
        const searchEl = document.getElementById('txn-search');
        const catEl = document.getElementById('txn-filter-cat');
        if (searchEl) searchEl.addEventListener('input', () => App.applyFilters());
        if (catEl) catEl.addEventListener('change', () => App.applyFilters());
    }

    if (state === 'TRANSFER_STEP_1') {
        SecurityEngine.resetVerification();
        StateMachine.clearFunnelData('transfer');

        const form = document.getElementById('transfer-step1-form');
        if (form) form.addEventListener('submit', (e) => {
            e.preventDefault();
            StateMachine.setFunnelData('transfer', {
                fromAccount: document.getElementById('trans-from').value,
                toRecipient: document.getElementById('trans-to').value
            });
            SystemLogger.log('TRANSFER', 'USER', 'Transfer step 1 — accounts selected.');
            Router.navigate('/transfer/step2');
        });
    }

    if (state === 'TRANSFER_STEP_2') {
        const amountInput = document.getElementById('trans-amount');
        const feeDisplay = document.getElementById('fee-breakdown');

        if (amountInput) {
            amountInput.addEventListener('input', () => {
                const amount = parseFloat(amountInput.value) || 0;
                const fees = LedgerEngine.calculateFees(amount);

                if (feeDisplay) {
                    feeDisplay.innerHTML = `
                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 10px;">
                            <div style="display: flex; justify-content: space-between;"><span>COT (2%):</span> <span>$${fees.cot.toFixed(2)}</span></div>
                            <div style="display: flex; justify-content: space-between;"><span>TAX (1.5%):</span> <span>$${fees.tax.toFixed(2)}</span></div>
                            <div style="display: flex; justify-content: space-between;"><span>IRS (0.1%):</span> <span>$${fees.irs.toFixed(2)}</span></div>
                            <div style="display: flex; justify-content: space-between; border-top: 1px solid #eee; margin-top: 5px; padding-top: 5px; font-weight: 600; color: var(--text-main);">
                                <span>Total Debit:</span> <span>$${fees.totalDebit.toFixed(2)}</span>
                            </div>
                        </div>
                    `;
                }
            });
        }

        const form = document.getElementById('transfer-step2-form');
        if (form) form.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('trans-amount').value) || 0;
            const fees = LedgerEngine.calculateFees(amount);
            StateMachine.setFunnelData('transfer', {
                amount,
                fees: fees.totalFees,
                totalDebit: fees.totalDebit,
                description: document.getElementById('trans-desc').value || 'Wire Transfer'
            });
            SystemLogger.log('TRANSFER', 'USER', `Transfer step 2 — amount: $${amount}`);
            Router.navigate('/transfer/step3');
        });
    }

    if (state === 'LOAN_STEP_2') {
        const amountInput = document.getElementById('loan-amount');
        const termSelect = document.getElementById('loan-term');
        const paymentDisplay = document.getElementById('est-payment');

        const updatePayment = () => {
            const amount = parseFloat(amountInput.value) || 0;
            const term = parseInt(termSelect.value) || 12;
            const rate = 0.0425 / 12;
            if (amount > 0) {
                const payment = (amount * rate) / (1 - Math.pow(1 + rate, -term));
                if (paymentDisplay) paymentDisplay.innerText = `$${payment.toFixed(2)}`;
            } else {
                if (paymentDisplay) paymentDisplay.innerText = '$0.00';
            }
        };

        if (amountInput) amountInput.addEventListener('input', updatePayment);
        if (termSelect) termSelect.addEventListener('change', updatePayment);

        const form = document.getElementById('loan-step2-form');
        if (form) form.addEventListener('submit', (e) => {
            e.preventDefault();
            StateMachine.setFunnelData('loan', {
                amount: parseFloat(document.getElementById('loan-amount').value) || 0,
                term: parseInt(document.getElementById('loan-term').value) || 12
            });
            SystemLogger.log('LOAN', 'USER', 'Loan step 2 completed.');
            Router.navigate('/loans/step3');
        });
    }

    if (state === 'LOAN_STEP_3') {
        const form = document.getElementById('loan-step3-form');
        if (form) form.addEventListener('submit', (e) => {
            e.preventDefault();
            StateMachine.setFunnelData('loan', {
                employment: document.getElementById('loan-employment').value,
                income: parseFloat(document.getElementById('loan-income').value) || 0,
                housing: parseFloat(document.getElementById('loan-housing').value) || 0
            });
            SystemLogger.log('LOAN', 'USER', 'Loan step 3 — financial details submitted.');
            Router.navigate('/loans/step4');
        });
    }

    if (state === 'LOAN_STEP_4') {
        const bar = document.getElementById('credit-progress-bar');
        const statusText = document.getElementById('credit-status-text');
        const statusSection = document.getElementById('credit-check-status');
        const completeSection = document.getElementById('credit-check-complete');

        let progress = 0;
        const statuses = [
            "Connecting to Credit Bureau...",
            "Retrieving Credit History...",
            "Analyzing Debt-to-Income Ratio...",
            "Verifying Employment Data...",
            "Finalizing Risk Assessment..."
        ];

        const interval = setInterval(() => {
            progress += 2;
            if (bar) bar.style.width = progress + '%';

            const statusIdx = Math.floor((progress / 100) * statuses.length);
            if (statusText && statuses[statusIdx]) {
                statusText.innerText = statuses[statusIdx];
            }

            if (progress >= 100) {
                clearInterval(interval);
                if (statusSection) statusSection.style.display = 'none';
                if (completeSection) completeSection.style.display = 'block';
                SystemLogger.log('LOAN', 'SYSTEM', 'Credit analysis complete.');
            }
        }, 100);
    }

    if (state === 'LOAN_STEP_5') {
        const loanData = StateMachine.getFunnelData('loan');
        const isApproved = loanData.income ? loanData.income > 50000 : Math.random() > 0.3;

        if (isApproved) {
            const el = document.getElementById('loan-approved');
            if (el) el.style.display = 'block';
            SystemLogger.log('LOAN_DECISION', 'SYSTEM', 'Loan APPROVED.');

            // Record loan
            StorageEngine.insert('loans', {
                userId: StorageEngine.getSession() ? StorageEngine.getSession().id : 'UNKNOWN',
                type: loanData.type || 'personal',
                amount: loanData.amount || 25000,
                term: loanData.term || 60,
                rate: 4.25,
                status: 'approved',
                decision: 'pre-approved'
            });
        } else {
            const el = document.getElementById('loan-rejected');
            if (el) el.style.display = 'block';
            SystemLogger.log('LOAN_DECISION', 'SYSTEM', 'Loan REJECTED.', 'WARN');
        }
    }

    // Admin events
    if (state === 'ADMIN_ACCOUNTS') {
        const form = document.getElementById('admin-create-account-form');
        if (form) form.addEventListener('submit', (e) => App.handleAdminAccountCreation(e));
    }

    if (state === 'ADMIN_KYC') {
        const approveBtn = document.getElementById('kyc-approve');
        const rejectBtn = document.getElementById('kyc-reject');
        if (approveBtn) approveBtn.addEventListener('click', () => {
            UIEngine.toast('KYC Identity Approved.', 'success');
            SystemLogger.log('KYC_DECISION', 'ADMIN', 'Identity approved.');
        });
        if (rejectBtn) rejectBtn.addEventListener('click', () => {
            UIEngine.toast('KYC Rejected — resubmission required.', 'warning');
            SystemLogger.log('KYC_DECISION', 'ADMIN', 'Identity rejected.', 'WARN');
        });
    }
}

// ================================================================
// BOOTSTRAP — Initialize all modules in correct order
// ================================================================
(function boot() {
    // Phase 1: Core engines
    SystemLogger.init();
    StorageEngine.init();
    SecurityEngine.init();

    // Phase 2: UI Engine
    UIEngine.init();

    // Phase 3: State Machine — Subscribe UI rendering
    StateMachine.subscribe((state, data) => {
        UIEngine.renderPage(state, data);
        // Attach interactive events after render
        setTimeout(() => attachEventsForState(state), 50);
    });

    // Phase 4: Router — Initializes hash listener and triggers first render
    Router.init();

    // Phase 5: Verification
    const integrity = LedgerEngine.verifyIntegrity();
    SystemLogger.log('BOOT_COMPLETE', 'SYSTEM',
        `Flagstar Bank v7.0 booted. Ledger: ${integrity.status} (${integrity.totalRecords} records). ` +
        `Storage: OK. Security: ${SecurityEngine.getVerificationStatus().allVerified ? 'UNLOCKED' : 'LOCKED'}.`
    );

    console.log("%cFLAGSTAR BANK v7.0 — DETERMINISTIC ENGINE", "color: #C8102E; font-size: 20px; font-weight: bold;");
    console.log("%cState Machine Active | Ledger Engine Active | Security Layers Active", "color: #10b981; font-weight: bold;");
    console.log("Modules: SystemLogger ✓ | StorageEngine ✓ | LedgerEngine ✓ | SecurityEngine ✓ | StateMachine ✓ | UIEngine ✓");
})();
