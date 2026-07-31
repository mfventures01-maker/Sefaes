// ────────────────────────────────────────────────────────────────────────────
// SEFAES COMMAND AUTH GATE — FRONTEND AUTH DISPATCHER
// The ONLY legal interface for auth operations from the UI.
// This module dispatches commands. It does NOT execute auth logic.
//
// ❌ Frontend CANNOT: validate roles, decide permissions, access admin APIs
// ✔  Frontend CAN: dispatch commands and receive deterministic responses
// ────────────────────────────────────────────────────────────────────────────

import { CommandBus } from '../lib/CommandBus';
import { AUTH_COMMANDS } from '../server/authGuard';
import type { CommandResponse } from '../lib/commandTypes';

const bus = CommandBus.getInstance();

/**
 * Auth Dispatcher — Pure command dispatch. No logic. No decisions.
 * Every method constructs a command envelope and dispatches it.
 */
export const authDispatcher = {
    /**
     * COMMAND: AUTH.SIGNUP_SELF
     * Public self-registration.
     */
    signUp: async (email: string, password: string, metadata?: Record<string, any>): Promise<CommandResponse> => {
        return bus.dispatchCommand({
            type: AUTH_COMMANDS.SIGNUP_SELF,
            payload: { email, password, metadata }
        });
    },

    /**
     * COMMAND: AUTH.SIGN_IN
     * Public sign-in with email/password.
     */
    signIn: async (email: string, password: string): Promise<CommandResponse> => {
        return bus.dispatchCommand({
            type: AUTH_COMMANDS.SIGN_IN,
            payload: { email, password }
        });
    },

    /**
     * COMMAND: AUTH.SIGN_IN_ANONYMOUS
     * Anonymous guest sign-in. Zero credentials required.
     * Requires "Allow anonymous sign-ins" enabled in Supabase Dashboard.
     */
    signInAnonymously: async (): Promise<CommandResponse> => {
        return bus.dispatchCommand({
            type: AUTH_COMMANDS.SIGN_IN_ANONYMOUS,
            payload: {}
        });
    },

    /**
     * COMMAND: AUTH.SIGN_OUT
     * Terminate current session.
     */
    signOut: async (): Promise<CommandResponse> => {
        return bus.dispatchCommand({
            type: AUTH_COMMANDS.SIGN_OUT,
            payload: {}
        });
    },

    /**
     * COMMAND: AUTH.GET_SESSION
     * Retrieve current session state.
     */
    getSession: async (): Promise<CommandResponse> => {
        return bus.dispatchCommand({
            type: AUTH_COMMANDS.GET_SESSION,
            payload: {}
        });
    },

    /**
     * COMMAND: AUTH.GET_USER
     * Retrieve current user details.
     */
    getUser: async (): Promise<CommandResponse> => {
        return bus.dispatchCommand({
            type: AUTH_COMMANDS.GET_USER,
            payload: {}
        });
    },

    /**
     * COMMAND: AUTH.CREATE_USER
     * Admin-only user creation with role assignment.
     */
    createUser: async (email: string, password: string, role: string): Promise<CommandResponse> => {
        return bus.dispatchCommand({
            type: AUTH_COMMANDS.CREATE_USER,
            payload: { email, password, role }
        });
    },

    /**
     * COMMAND: AUTH.DELETE_USER
     * Super-admin only user deletion.
     */
    deleteUser: async (userId: string): Promise<CommandResponse> => {
        return bus.dispatchCommand({
            type: AUTH_COMMANDS.DELETE_USER,
            payload: { userId }
        });
    },

    /**
     * COMMAND: AUTH.UPDATE_ROLE
     * CEO/Super-admin role update.
     */
    updateRole: async (userId: string, newRole: string): Promise<CommandResponse> => {
        return bus.dispatchCommand({
            type: AUTH_COMMANDS.UPDATE_ROLE,
            payload: { userId, newRole }
        });
    },

    /**
     * COMMAND: AUTH.RESET_PASSWORD
     * Request password reset email.
     * @param redirectTo - Self-healing redirect URL resolved from env var or window.location.origin
     */
    resetPassword: async (email: string, redirectTo?: string): Promise<CommandResponse> => {
        return bus.dispatchCommand({
            type: 'AUTH.RESET_PASSWORD',
            payload: { email, redirectTo }
        });
    },

    /**
     * COMMAND: AUTH.UPDATE_PASSWORD
     * Update password with new password.
     */
    updatePassword: async (password: string): Promise<CommandResponse> => {
        return bus.dispatchCommand({
            type: 'AUTH.UPDATE_PASSWORD',
            payload: { password }
        });
    }
};

