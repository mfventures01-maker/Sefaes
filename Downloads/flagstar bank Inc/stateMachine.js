/**
 * ================================================================
 * FLAGSTAR BANK — STATE MACHINE CONTROLLER v7.0
 * Central Deterministic State Controller
 * ================================================================
 * ALL application flow is routed through this controller.
 * No UI changes occur without state machine authorization.
 * Direct DOM manipulation outside render controllers is forbidden.
 * ================================================================
 */

const StateMachine = {
    // --- State Definitions ---
    STATES: {
        // Public states
        PUBLIC_HOME: 'PUBLIC_HOME',
        PUBLIC_PERSONAL: 'PUBLIC_PERSONAL',
        PUBLIC_BUSINESS: 'PUBLIC_BUSINESS',
        PUBLIC_ABOUT: 'PUBLIC_ABOUT',
        PUBLIC_LOGIN: 'PUBLIC_LOGIN',

        // Registration funnel
        REG_STEP_1: 'REG_STEP_1',
        REG_STEP_2: 'REG_STEP_2',
        REG_STEP_3: 'REG_STEP_3',
        REG_STEP_4: 'REG_STEP_4',

        // Authenticated states
        AUTH_DASHBOARD: 'AUTH_DASHBOARD',
        AUTH_ACCOUNTS: 'AUTH_ACCOUNTS',
        AUTH_CARDS: 'AUTH_CARDS',
        AUTH_PROFILE: 'AUTH_PROFILE',

        // Transfer funnel
        TRANSFER_STEP_1: 'TRANSFER_STEP_1',
        TRANSFER_STEP_2: 'TRANSFER_STEP_2',
        TRANSFER_STEP_3: 'TRANSFER_STEP_3',
        TRANSFER_VERIFY_TAX: 'TRANSFER_VERIFY_TAX',
        TRANSFER_VERIFY_IRS: 'TRANSFER_VERIFY_IRS',
        TRANSFER_STEP_4: 'TRANSFER_STEP_4',

        // Loan funnel
        LOAN_STEP_1: 'LOAN_STEP_1',
        LOAN_STEP_2: 'LOAN_STEP_2',
        LOAN_STEP_3: 'LOAN_STEP_3',
        LOAN_STEP_4: 'LOAN_STEP_4',
        LOAN_STEP_5: 'LOAN_STEP_5',

        // Admin states
        ADMIN_DASHBOARD: 'ADMIN_DASHBOARD',
        ADMIN_ACCOUNTS: 'ADMIN_ACCOUNTS',
        ADMIN_CODES: 'ADMIN_CODES',
        ADMIN_KYC: 'ADMIN_KYC',
        ADMIN_TRANSACTIONS: 'ADMIN_TRANSACTIONS',
        ADMIN_REPORTS: 'ADMIN_REPORTS',
        ADMIN_CONFIG: 'ADMIN_CONFIG',

        // Error states
        ERROR_404: 'ERROR_404'
    },

    // --- Current State ---
    _currentState: null,
    _previousState: null,
    _stateData: {},
    _listeners: [],

    // --- Funnel Session Data ---
    _funnelData: {
        registration: {},
        transfer: {},
        loan: {}
    },

    // --- State-to-Template Mapping ---
    _templateMap: {
        PUBLIC_HOME: 'public-home',
        PUBLIC_PERSONAL: 'personal',
        PUBLIC_BUSINESS: 'business',
        PUBLIC_ABOUT: 'about',
        PUBLIC_LOGIN: 'login',
        REG_STEP_1: 'register-step1',
        REG_STEP_2: 'register-step2',
        REG_STEP_3: 'register-step3',
        REG_STEP_4: 'register-step4',
        AUTH_DASHBOARD: 'dashboard',
        AUTH_ACCOUNTS: 'accounts',
        AUTH_CARDS: 'cards',
        AUTH_PROFILE: 'profile',
        TRANSFER_STEP_1: 'transfer-step1',
        TRANSFER_STEP_2: 'transfer-step2',
        TRANSFER_STEP_3: 'transfer-step3',
        TRANSFER_VERIFY_TAX: 'transfer-verify-tax',
        TRANSFER_VERIFY_IRS: 'transfer-verify-irs',
        TRANSFER_STEP_4: 'transfer-step4',
        LOAN_STEP_1: 'loans-step1',
        LOAN_STEP_2: 'loans-step2',
        LOAN_STEP_3: 'loans-step3',
        LOAN_STEP_4: 'loans-step4',
        LOAN_STEP_5: 'loans-step5',
        ADMIN_DASHBOARD: 'admin-dashboard',
        ADMIN_ACCOUNTS: 'admin-accounts',
        ADMIN_CODES: 'admin-codes',
        ADMIN_KYC: 'admin-kyc',
        ADMIN_TRANSACTIONS: 'admin-transactions',
        ADMIN_REPORTS: 'admin-reports',
        ADMIN_CONFIG: 'admin-config'
    },

    // --- Route-to-State Mapping ---
    _routeMap: {
        '/': 'DYNAMIC_HOME',
        '/login': 'PUBLIC_LOGIN',
        '/register': 'REG_STEP_1',
        '/register/step1': 'REG_STEP_1',
        '/register/step2': 'REG_STEP_2',
        '/register/step3': 'REG_STEP_3',
        '/register/step4': 'REG_STEP_4',
        '/dashboard': 'AUTH_DASHBOARD',
        '/accounts': 'AUTH_ACCOUNTS',
        '/transfer': 'TRANSFER_STEP_1',
        '/transfer/step1': 'TRANSFER_STEP_1',
        '/transfer/step2': 'TRANSFER_STEP_2',
        '/transfer/step3': 'TRANSFER_STEP_3',
        '/transfer/verify-tax': 'TRANSFER_VERIFY_TAX',
        '/transfer/verify-irs': 'TRANSFER_VERIFY_IRS',
        '/transfer/step4': 'TRANSFER_STEP_4',
        '/loans': 'LOAN_STEP_1',
        '/loans/step1': 'LOAN_STEP_1',
        '/loans/step2': 'LOAN_STEP_2',
        '/loans/step3': 'LOAN_STEP_3',
        '/loans/step4': 'LOAN_STEP_4',
        '/loans/step5': 'LOAN_STEP_5',
        '/personal': 'PUBLIC_PERSONAL',
        '/business': 'PUBLIC_BUSINESS',
        '/about': 'PUBLIC_ABOUT',
        '/cards': 'AUTH_CARDS',
        '/profile': 'AUTH_PROFILE',
        '/admin': 'ADMIN_DASHBOARD',
        '/admin/accounts': 'ADMIN_ACCOUNTS',
        '/admin/codes': 'ADMIN_CODES',
        '/admin/kyc': 'ADMIN_KYC',
        '/admin/transactions': 'ADMIN_TRANSACTIONS',
        '/admin/reports': 'ADMIN_REPORTS',
        '/admin/config': 'ADMIN_CONFIG'
    },

    // --- Protected State Groups ---
    _authRequired: [
        'AUTH_DASHBOARD', 'AUTH_ACCOUNTS', 'AUTH_CARDS', 'AUTH_PROFILE',
        'TRANSFER_STEP_1', 'TRANSFER_STEP_2', 'TRANSFER_STEP_3',
        'TRANSFER_VERIFY_TAX', 'TRANSFER_VERIFY_IRS', 'TRANSFER_STEP_4',
        'LOAN_STEP_1', 'LOAN_STEP_2', 'LOAN_STEP_3', 'LOAN_STEP_4', 'LOAN_STEP_5'
    ],

    _adminRequired: [
        'ADMIN_DASHBOARD', 'ADMIN_ACCOUNTS', 'ADMIN_CODES',
        'ADMIN_KYC', 'ADMIN_TRANSACTIONS', 'ADMIN_REPORTS', 'ADMIN_CONFIG'
    ],

    // ================================================================
    // PUBLIC API
    // ================================================================

    /**
     * Get the current state
     * @returns {string}
     */
    getState() {
        return this._currentState;
    },

    /**
     * Get the previous state
     * @returns {string}
     */
    getPreviousState() {
        return this._previousState;
    },

    /**
     * Get state-specific data
     * @returns {Object}
     */
    getStateData() {
        return { ...this._stateData };
    },

    /**
     * Get funnel session data
     * @param {string} funnel - Funnel name (registration, transfer, loan)
     * @returns {Object}
     */
    getFunnelData(funnel) {
        return { ...this._funnelData[funnel] };
    },

    /**
     * Update funnel session data
     * @param {string} funnel - Funnel name
     * @param {Object} data - Data to merge
     */
    setFunnelData(funnel, data) {
        if (!this._funnelData[funnel]) {
            SystemLogger.error('StateMachine', `Invalid funnel: ${funnel}`, 'Data not saved', 'Use: registration, transfer, or loan');
            return;
        }
        this._funnelData[funnel] = { ...this._funnelData[funnel], ...data };
        SystemLogger.log('FUNNEL_DATA_UPDATE', 'STATE_MACHINE', `Funnel data updated for ${funnel}`);
    },

    /**
     * Clear funnel session data
     * @param {string} funnel - Funnel name
     */
    clearFunnelData(funnel) {
        if (this._funnelData[funnel]) {
            this._funnelData[funnel] = {};
        }
    },

    /**
     * Transition to a new state
     * This is the ONLY way to change application state.
     * @param {string} newState - Target state
     * @param {Object} [data] - Optional state data
     * @returns {boolean} Whether the transition was allowed
     */
    transition(newState, data = {}) {
        // Validate state exists
        if (!this.STATES[newState] && newState !== 'DYNAMIC_HOME') {
            SystemLogger.error('StateMachine', `Invalid state: ${newState}`, 'Transition blocked', 'Use a valid state from StateMachine.STATES');
            return false;
        }

        // Handle dynamic home
        if (newState === 'DYNAMIC_HOME') {
            const session = StorageEngine.getSession();
            newState = session ? 'AUTH_DASHBOARD' : 'PUBLIC_HOME';
        }

        // Auth gate
        if (this._authRequired.includes(newState)) {
            const session = StorageEngine.getSession();
            if (!session) {
                SystemLogger.log('AUTH_GATE', 'STATE_MACHINE', `Access denied to ${newState} — not authenticated`, 'WARN');
                this.transition('PUBLIC_LOGIN');
                return false;
            }
        }

        // Admin gate
        if (this._adminRequired.includes(newState)) {
            const session = StorageEngine.getSession();
            if (!session || session.role !== 'admin') {
                SystemLogger.log('ADMIN_GATE', 'STATE_MACHINE', `Admin access denied to ${newState}`, 'WARN');
                this.transition('PUBLIC_HOME');
                return false;
            }
        }

        // Funnel sequence validation
        if (!this._validateFunnelTransition(newState)) {
            SystemLogger.log('FUNNEL_GATE', 'STATE_MACHINE', `Invalid funnel sequence: ${this._currentState} → ${newState}`, 'WARN');
            return false;
        }

        // Execute transition
        this._previousState = this._currentState;
        this._currentState = newState;
        this._stateData = data;

        SystemLogger.log('STATE_TRANSITION', 'STATE_MACHINE', `${this._previousState || 'INIT'} → ${newState}`);

        // Notify listeners
        this._notifyListeners(newState, data);

        return true;
    },

    /**
     * Subscribe to state changes
     * @param {Function} callback - Called with (newState, data) on each transition
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(l => l !== callback);
        };
    },

    /**
     * Resolve a hash route to a state
     * @param {string} hash - Hash path (e.g., '/dashboard')
     * @returns {string|null} State or null
     */
    resolveRoute(hash) {
        const path = (hash || '/').split('?')[0];
        return this._routeMap[path] || null;
    },

    /**
     * Get the template ID for the current state
     * @returns {string|null}
     */
    getCurrentTemplateId() {
        return this._templateMap[this._currentState] || null;
    },

    /**
     * Get the hash route for a state
     * @param {string} state - State name
     * @returns {string} Hash path
     */
    getRouteForState(state) {
        for (const [route, s] of Object.entries(this._routeMap)) {
            if (s === state) return route;
        }
        return '/';
    },

    // ================================================================
    // PRIVATE METHODS
    // ================================================================

    /**
     * Validate funnel step ordering
     * Registration: 1 → 2 → 3 → 4
     * Transfer: 1 → 2 → 3 → TAX → IRS → 4
     * Loan: 1 → 2 → 3 → 4 → 5
     */
    _validateFunnelTransition(newState) {
        // Registration funnel — can always enter step 1
        const regSteps = ['REG_STEP_1', 'REG_STEP_2', 'REG_STEP_3', 'REG_STEP_4'];
        if (regSteps.includes(newState) && newState !== 'REG_STEP_1') {
            const currentIdx = regSteps.indexOf(this._currentState);
            const targetIdx = regSteps.indexOf(newState);
            // Allow going forward by 1 step or backward any amount
            if (targetIdx > currentIdx + 1 && currentIdx >= 0) {
                return false; // Cannot skip steps
            }
        }

        // Transfer funnel — can always enter step 1 if authenticated
        const transferSteps = ['TRANSFER_STEP_1', 'TRANSFER_STEP_2', 'TRANSFER_STEP_3', 'TRANSFER_VERIFY_TAX', 'TRANSFER_VERIFY_IRS', 'TRANSFER_STEP_4'];
        if (transferSteps.includes(newState) && newState !== 'TRANSFER_STEP_1') {
            const currentIdx = transferSteps.indexOf(this._currentState);
            const targetIdx = transferSteps.indexOf(newState);
            if (targetIdx > currentIdx + 1 && currentIdx >= 0) {
                return false;
            }
        }

        // Loan funnel — can always enter step 1
        const loanSteps = ['LOAN_STEP_1', 'LOAN_STEP_2', 'LOAN_STEP_3', 'LOAN_STEP_4', 'LOAN_STEP_5'];
        if (loanSteps.includes(newState) && newState !== 'LOAN_STEP_1') {
            const currentIdx = loanSteps.indexOf(this._currentState);
            const targetIdx = loanSteps.indexOf(newState);
            if (targetIdx > currentIdx + 1 && currentIdx >= 0) {
                return false;
            }
        }

        return true;
    },

    _notifyListeners(state, data) {
        this._listeners.forEach(cb => {
            try {
                cb(state, data);
            } catch (e) {
                SystemLogger.error('StateMachine', `Listener error: ${e.message}`, 'Listener may have failed', 'Check subscriber callbacks');
            }
        });
    }
};
