// ────────────────────────────────────────────────────────────────────────────
// SEFAES COMMAND AUTH GATE — AUTH RESOLVER
// Extracts and validates identity from JWT. Server-only truth source.
// ❌ No fallback identity allowed
// ❌ No client-provided role accepted
// ────────────────────────────────────────────────────────────────────────────

import { auth } from '../db/dbGateway';
import { verifyJwtIdentity } from './security/jwtVerifier';

export interface ResolvedIdentity {
    userId: string;
    role: string;
    email?: string;
    institutionId?: string;
    schoolId?: string;
}

export type AuthResolverResult =
    | { authenticated: true; identity: ResolvedIdentity }
    | { authenticated: false; reason: string };

// Public commands that bypass session validation
const PUBLIC_COMMANDS = [
    'AUTH.SIGNUP_SELF',
    'AUTH.SIGN_IN',
    'AUTH.SIGN_IN_ANONYMOUS',
    'AUTH.RESET_PASSWORD',
    'AUTH.UPDATE_PASSWORD',
];

let mockIdentity: ResolvedIdentity | null = null;
let mockAuthError: string | null = null;

export function setMockIdentity(identity: ResolvedIdentity | null, errorReason: string | null = null) {
    mockIdentity = identity;
    mockAuthError = errorReason;
}

/**
 * Resolves identity ONLY from a verified Supabase session/JWT.
 * This runs server-side and never trusts client-provided identity.
 */
export async function resolveAuth(jwt?: string, commandType?: string): Promise<AuthResolverResult> {
    // Bypass session validation for public commands
    if (commandType && PUBLIC_COMMANDS.includes(commandType)) {
        return {
            authenticated: true,
            identity: getPublicIdentity(),
        };
    }

    if (mockIdentity) {
        if (process.env.NODE_ENV !== 'test' && process.env.TEST_ENV !== 'true') {
            throw new Error("Mock identity forbidden outside tests");
        }
        return {
            authenticated: true,
            identity: mockIdentity
        };
    }
    if (mockAuthError) {
        return {
            authenticated: false,
            reason: mockAuthError
        };
    }
    try {
        let token = jwt;
        if (!token) {
            const { data: sessionData, error: sessionError } = await auth.getSession();
            if (sessionError || !sessionData?.session) {
                return {
                    authenticated: false,
                    reason: 'NO_VALID_SESSION'
                };
            }
            token = sessionData.session.access_token;
        }

        if (!token) {
            return {
                authenticated: false,
                reason: 'NO_JWT_PROVIDED'
            };
        }

        const user = await verifyJwtIdentity(token);

        const identity: ResolvedIdentity = {
            userId: user.userId,
            role: user.role,
            email: user.email || '',
            institutionId: user.institutionId,
            schoolId: user.schoolId
        };

        return {
            authenticated: true,
            identity
        };
    } catch (err: any) {
        return {
            authenticated: false,
            reason: `AUTH_RESOLVER_ERROR: ${err.message}`
        };
    }
}

/**
 * For public commands (e.g., AUTH.SIGNUP_SELF), returns a public identity.
 * This is the ONLY path where unauthenticated access is allowed.
 */
export function getPublicIdentity(): ResolvedIdentity {
    return {
        userId: 'public',
        role: 'public',
        email: ''
    };
}
