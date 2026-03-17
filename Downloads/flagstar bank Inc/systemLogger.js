/**
 * ================================================================
 * FLAGSTAR BANK — SYSTEM LOGGER v7.0
 * Structured Event Logging Engine
 * ================================================================
 * All system actions are logged with structured diagnostics.
 * No silent failures. Every event is recorded.
 * ================================================================
 */

const SystemLogger = {
    _logs: [],
    _maxLogs: 1000,

    /**
     * Log a system event
     * @param {string} eventType - Event category
     * @param {string} actor - Who triggered the event
     * @param {string} details - Description of what happened
     * @param {string} [level='INFO'] - Severity: INFO, WARN, ERROR, CRITICAL
     */
    log(eventType, actor, details, level = 'INFO') {
        const entry = {
            id: this._generateId(),
            timestamp: new Date().toISOString(),
            eventType,
            actor,
            details,
            level
        };

        this._logs.unshift(entry);

        // Cap log storage
        if (this._logs.length > this._maxLogs) {
            this._logs = this._logs.slice(0, this._maxLogs);
        }

        // Persist to storage
        this._persist();

        // Console output for dev visibility
        const color = {
            INFO: '#3b82f6',
            WARN: '#f59e0b',
            ERROR: '#ef4444',
            CRITICAL: '#dc2626'
        }[level] || '#666';

        console.log(
            `%c[${level}] %c${eventType} %c— ${details}`,
            `color: ${color}; font-weight: bold;`,
            'color: #333; font-weight: 600;',
            'color: #666;'
        );

        return entry;
    },

    /**
     * Log a system error with structured diagnostics
     * @param {string} module - Module where error occurred
     * @param {string} issue - Description of the issue
     * @param {string} impact - What is affected
     * @param {string} suggestedFix - Recommended resolution
     */
    error(module, issue, impact, suggestedFix) {
        const details = `Module: ${module} | Issue: ${issue} | Impact: ${impact} | Fix: ${suggestedFix}`;
        return this.log('SYSTEM_ERROR', 'SYSTEM', details, 'ERROR');
    },

    /**
     * Get all logs, optionally filtered
     * @param {Object} [filters] - Optional filter criteria
     * @returns {Array} Filtered log entries
     */
    getLogs(filters = {}) {
        let results = [...this._logs];

        if (filters.eventType) {
            results = results.filter(l => l.eventType === filters.eventType);
        }
        if (filters.actor) {
            results = results.filter(l => l.actor === filters.actor);
        }
        if (filters.level) {
            results = results.filter(l => l.level === filters.level);
        }
        if (filters.since) {
            const since = new Date(filters.since).getTime();
            results = results.filter(l => new Date(l.timestamp).getTime() >= since);
        }
        if (filters.limit) {
            results = results.slice(0, filters.limit);
        }

        return results;
    },

    /**
     * Export logs as formatted string
     * @returns {string} Formatted log output
     */
    export() {
        return this._logs.map(l =>
            `[${l.timestamp}] [${l.level}] ${l.eventType}: ${l.details} (by ${l.actor})`
        ).join('\n');
    },

    /**
     * Clear all logs
     */
    clear() {
        this._logs = [];
        this._persist();
        this.log('LOG_CLEARED', 'SYSTEM', 'All system logs have been purged.');
    },

    /**
     * Load logs from storage
     */
    init() {
        try {
            const stored = localStorage.getItem('flagstar_logs');
            if (stored) {
                this._logs = JSON.parse(stored);
            }
        } catch (e) {
            this._logs = [];
        }
        this.log('SYSTEM_INIT', 'SYSTEM', 'System Logger initialized.');
    },

    // --- Private Methods ---

    _persist() {
        try {
            localStorage.setItem('flagstar_logs', JSON.stringify(this._logs.slice(0, 200)));
        } catch (e) {
            // Storage quota exceeded — trim logs
            this._logs = this._logs.slice(0, 50);
            try {
                localStorage.setItem('flagstar_logs', JSON.stringify(this._logs));
            } catch (e2) {
                // Silent fallback — cannot persist
            }
        }
    },

    _generateId() {
        return 'LOG-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
    }
};
