import { supabase } from '../lib/supabase';
import { checkMutationAllowed } from '../engine/mutationPolicy';
import { callRPC, queryTable, initializeRpcClient } from '../lib/rpcClient';

// Initialize rpcClient helper with the proxy-wrapped supabase client
initializeRpcClient(supabase);

/**
 * DB Gateway
 * The only legal interface to Supabase.
 */
let mockAuthUser: any = null;
let mockDbSelectResult: any = null;
let mockDbRpcResult: any = null;

export function setMockAuthUser(user: any) {
    mockAuthUser = user;
}

export function setMockDbSelect(result: any) {
    mockDbSelectResult = result;
}

export function setMockDbRpc(result: any) {
    mockDbRpcResult = result;
}

/**
 * DB Gateway
 * The only legal interface to Supabase.
 */
export const db = {
    /**
     * Executes safe read-only queries on the database.
     */
    select: async <T = any>(
        table: string,
        queryFn: (builder: ReturnType<typeof supabase.from>) => any
    ): Promise<T> => {
        if (mockDbSelectResult !== null) {
            return mockDbSelectResult as T;
        }
        return queryTable<T>(table, queryFn);
    },

    /**
     * Executes mutations. MUST pass through mutationPolicy.checkMutationAllowed.
     */
    rpc: async <T = any>(name: string, payload?: any): Promise<T> => {
        if (mockDbRpcResult !== null) {
            return mockDbRpcResult as T;
        }
        checkMutationAllowed(name);
        return callRPC<T>(name, payload);
    },

    /**
     * Handles file storage operations.
     */
    storage: {
        upload: async (bucket: string, path: string, file: File | Blob) => {
            const { data, error } = await supabase.storage.from(bucket).upload(path, file);
            if (error) throw error;
            return data;
        },
        getPublicUrl: (bucket: string, path: string) => {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path);
            return data;
        }
    }
};

/**
 * Functions Gateway
 * Handles Supabase Edge Function invocations.
 */
export const functions = {
    invoke: async (functionName: string, options?: any) => {
        return supabase.functions.invoke(functionName, options);
    }
};

/**
 * Auth Gateway
 * Facade for Supabase Auth services.
 */
export const auth = {
    getUser: async () => {
        if (mockAuthUser) {
            return { data: { user: mockAuthUser }, error: null };
        }
        return supabase.auth.getUser();
    },
    getSession: async () => {
        if (mockAuthUser) {
            return {
                data: {
                    session: {
                        user: mockAuthUser,
                        access_token: 'mock-access-token',
                        expires_at: Math.floor(Date.now() / 1000) + 3600
                    }
                },
                error: null
            };
        }
        return supabase.auth.getSession();
    },
    signInWithPassword: (credentials: any) => supabase.auth.signInWithPassword(credentials),
    signUp: (credentials: any) => supabase.auth.signUp(credentials),
    resetPasswordForEmail: (email: string, options?: any) =>
        supabase.auth.resetPasswordForEmail(email, options),
    updateUser: (attributes: any) => supabase.auth.updateUser(attributes),
    signInAnonymously: () => supabase.auth.signInAnonymously(),
    signOut: async () => {
        if (mockAuthUser) {
            return { error: null };
        }
        return supabase.auth.signOut();
    }
};
