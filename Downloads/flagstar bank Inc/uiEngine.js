/**
 * ================================================================
 * FLAGSTAR BANK — UI ENGINE v7.0
 * Render Controller — All DOM mutations go through this engine
 * ================================================================
 * Direct DOM manipulation outside this module is forbidden.
 * All UI changes are triggered by the State Machine.
 * ================================================================
 */

const UIEngine = {
    _elements: {},
    _toastContainer: null,

    /**
     * Initialize the UI Engine
     * Caches core DOM references
     */
    init() {
        this._elements = {
            app: document.getElementById('app'),
            navbar: document.getElementById('navbar'),
            content: document.getElementById('content'),
            footer: document.getElementById('footer-section')
        };

        // Create toast container
        this._toastContainer = document.createElement('div');
        this._toastContainer.className = 'toast-container';
        this._toastContainer.id = 'toast-container';
        document.body.appendChild(this._toastContainer);

        // Setup mobile navigation
        this._setupMobileNav();

        SystemLogger.log('UI_INIT', 'SYSTEM', 'UI Engine initialized. DOM references cached.');
    },

    // ================================================================
    // RENDERING
    // ================================================================

    /**
     * Render a template into the content area
     * Called ONLY by the state machine subscriber
     * @param {string} templateId - Template ID (without 'tpl-' prefix)
     * @param {Object} data - Template data bindings
     */
    renderContent(templateId, data = {}) {
        const tpl = document.getElementById('tpl-' + templateId);
        if (!tpl) {
            SystemLogger.error('UIEngine', `Template not found: tpl-${templateId}`, 'Content area blank', 'Add the template to the HTML');
            this._elements.content.innerHTML = this._get404HTML();
            return;
        }

        this._elements.content.innerHTML = this._parseTemplate('tpl-' + templateId, data);
        window.scrollTo(0, 0);

        SystemLogger.log('UI_RENDER', 'UI_ENGINE', `Rendered template: ${templateId}`);
    },

    /**
     * Render the navbar based on auth state
     * @param {boolean} isAuthenticated
     * @param {Object} user - User data
     */
    renderNavbar(isAuthenticated, user = {}) {
        if (isAuthenticated) {
            this._elements.navbar.innerHTML = this._parseTemplate('tpl-nav-auth', {
                name: user.name || 'Customer'
            });
        } else {
            this._elements.navbar.innerHTML = this._parseTemplate('tpl-nav-public', {});
        }

        // Re-attach mobile nav after re-render
        this._setupMobileNav();
    },

    /**
     * Render the footer
     */
    renderFooter() {
        this._elements.footer.innerHTML = this._parseTemplate('tpl-footer', {});
    },

    /**
     * Render a full page transition
     * @param {string} state - State name
     * @param {Object} data - Template data
     */
    renderPage(state, data = {}) {
        const session = StorageEngine.getSession();
        const isAuth = !!session;

        // Build template data with defaults
        const templateData = {
            name: session ? session.name : 'Customer',
            sessionId: Math.floor(Math.random() * 1000000),
            refId: Math.floor(Math.random() * 1000000),
            ...data
        };

        // Render navbar
        this.renderNavbar(isAuth, session || {});

        // Render content
        const templateId = StateMachine._templateMap[state];
        if (templateId) {
            this.renderContent(templateId, templateData);
        } else {
            this._elements.content.innerHTML = this._get404HTML();
        }

        // Render footer
        this.renderFooter();
    },

    // ================================================================
    // TOAST NOTIFICATIONS
    // ================================================================

    /**
     * Show a toast notification
     * @param {string} message - Notification message
     * @param {string} [type='info'] - Type: success, error, warning, info
     * @param {number} [duration=3000] - Auto-dismiss duration in ms
     */
    toast(message, type = 'info', duration = 3000) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;

        this._toastContainer.appendChild(toast);

        // Auto-dismiss
        setTimeout(() => {
            toast.classList.add('exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // ================================================================
    // LOADING SIMULATOR
    // ================================================================

    /**
     * Create and start a loading simulation
     * @param {string} elementId - Container element ID
     * @param {Object} options - Configuration
     * @returns {Object} Controller with start() method
     */
    createLoader(elementId, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) return null;

        const config = {
            duration: options.duration || 2000,
            steps: options.steps || 10,
            message: options.message || 'Processing...',
            completeMessage: options.completeMessage || 'Complete!',
            onComplete: options.onComplete || null
        };

        let currentStep = 0;
        let interval = null;

        const getLoadingHTML = (step) => {
            const percent = Math.floor((step / config.steps) * 100);
            return `
                <div class="loading-simulator">
                    <div class="loading-message">${config.message}</div>
                    <div class="loading-bar-container">
                        <div class="loading-bar-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="loading-percent">${percent}%</div>
                    <div class="loading-details">${'█'.repeat(step)}${'░'.repeat(config.steps - step)}</div>
                </div>
            `;
        };

        const getCompleteHTML = () => `
            <div class="loading-complete">
                <div class="complete-message">✅ ${config.completeMessage}</div>
            </div>
        `;

        return {
            start() {
                currentStep = 0;
                element.innerHTML = getLoadingHTML(0);
                interval = setInterval(() => {
                    currentStep++;
                    if (currentStep <= config.steps) {
                        element.innerHTML = getLoadingHTML(currentStep);
                    } else {
                        clearInterval(interval);
                        element.innerHTML = getCompleteHTML();
                        if (config.onComplete) config.onComplete();
                    }
                }, config.duration / config.steps);
            },
            stop() {
                if (interval) clearInterval(interval);
            }
        };
    },

    /**
     * Simulate processing with a message sequence
     * @param {string} elementId - Container element ID
     * @param {Array} messages - Array of status messages
     * @param {Function} onComplete - Called when done
     */
    simulateProcessing(elementId, messages, onComplete) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let idx = 0;
        const bar = document.getElementById(elementId + '-bar');

        const interval = setInterval(() => {
            idx++;
            const progress = Math.min((idx / messages.length) * 100, 100);

            if (bar) bar.style.width = progress + '%';

            const statusText = document.getElementById(elementId + '-text');
            if (statusText && messages[idx - 1]) {
                statusText.innerText = messages[idx - 1];
            }

            if (idx >= messages.length) {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, 1000);
    },

    // ================================================================
    // MOBILE NAVIGATION
    // ================================================================

    _setupMobileNav() {
        const navbar = this._elements.navbar;
        if (!navbar) return;

        const navContent = navbar.querySelector('.nav-content');
        if (!navContent) return;

        // Only add hamburger if it doesn't exist
        if (!navContent.querySelector('.hamburger')) {
            const hamburger = document.createElement('button');
            hamburger.className = 'hamburger';
            hamburger.setAttribute('aria-label', 'Toggle navigation menu');
            hamburger.innerHTML = '<span></span><span></span><span></span>';
            navContent.appendChild(hamburger);

            hamburger.addEventListener('click', () => {
                const navLinks = navbar.querySelector('.nav-links');
                const overlay = document.querySelector('.mobile-overlay');

                hamburger.classList.toggle('active');
                if (navLinks) navLinks.classList.toggle('open');
                if (overlay) overlay.classList.toggle('active');
            });
        }

        // Create overlay if it doesn't exist
        if (!document.querySelector('.mobile-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'mobile-overlay';
            document.body.appendChild(overlay);

            overlay.addEventListener('click', () => {
                this._closeMobileNav();
            });
        }
    },

    _closeMobileNav() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const overlay = document.querySelector('.mobile-overlay');

        if (hamburger) hamburger.classList.remove('active');
        if (navLinks) navLinks.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    },

    // ================================================================
    // PRIVATE METHODS
    // ================================================================

    _parseTemplate(id, data) {
        const tpl = document.getElementById(id);
        if (!tpl) return '';

        let html = tpl.innerHTML;
        for (const key in data) {
            html = html.replace(new RegExp('{{' + key + '}}', 'g'), data[key]);
        }
        return html;
    },

    _get404HTML() {
        return `
            <section class="container" style="text-align: center; padding: 100px 0;">
                <h1 style="font-size: 5rem; color: var(--flagstar-red);">404</h1>
                <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 30px;">Page not found. The vault is empty.</p>
                <a href="#/" class="btn btn-primary">Return Home</a>
            </section>
        `;
    }
};
