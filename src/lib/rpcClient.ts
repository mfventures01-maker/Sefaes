// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC RPC CLIENT
// Single communication gateway to backend
// All mutations MUST pass through this function
// ──────────────────────────────────────────────

import { RPC_SIGNALS } from './rpcSignalRegistry';
import { checkMutationAllowed } from '../engine/mutationPolicy';

let supabaseClient: any = null;
let mockRpcResult: any = null;
let mockQueryResult: any = null;

export function setMockRpcResult(result: any) {
    mockRpcResult = result;
}

export function setMockQueryResult(result: any) {
    mockQueryResult = result;
}

/**
 * Initializes the RPC client with the Supabase instance to break circular dependencies.
 */
export function initializeRpcClient(client: any) {
    supabaseClient = client;
}

/**
 * Executes a Supabase RPC call with standardized error handling.
 * This is the ONLY permitted way for the frontend to mutate data.
 *
 * @param functionName - The PostgreSQL function name to invoke
 * @param payload - Optional named parameters for the function
 * @returns The response data from the RPC function
 * @throws Error with structured RPC failure message
 */
export async function callRPC<T = any>(
    functionName: string,
    payload?: Record<string, any>
): Promise<T> {
    if (mockRpcResult !== null) {
        return mockRpcResult as T;
    }

    checkMutationAllowed(functionName);

    if (!supabaseClient) {
        throw new Error('Supabase client not initialized in rpcClient');
    }

    if (functionName === RPC_SIGNALS.CREATE_INSTITUTION_ACCOUNT) {
        const allowed = [
            '_institution_name',
            '_admin_email',
            '_admin_password',
            '_institution_type',
            '_country'
        ];
        const keys = Object.keys(payload || {});

        for (const key of keys) {
            if (!allowed.includes(key)) {
                throw new Error(`[RPC_FIREWALL] Invalid key: ${key}`);
            }
        }
    }

    const { data, error } = await supabaseClient.rpc(functionName, payload || {});

    if (error) {
        console.error(`[RPC_FAILURE] ${functionName}:`, error.message);
        throw new Error(`RPC ${functionName} failed: ${error.message}`);
    }

    return data as T;
}

/**
 * Executes a read-only query via Supabase's query builder.
 * Reads are permitted directly — only mutations require RPC.
 *
 * @param table - The table to query
 * @param query - A callback that receives the query builder
 * @returns The query result data
 */
export async function queryTable<T = any>(
    table: string,
    query: (builder: any) => any
): Promise<T> {
    if (mockQueryResult !== null) {
        return mockQueryResult as T;
    }

    if (!supabaseClient) {
        throw new Error('Supabase client not initialized in rpcClient');
    }
    const builder = supabaseClient.from(table);
    const { data, error } = await query(builder);

    if (error) {
        console.error(`[QUERY_FAILURE] ${table}:`, error.message);
        throw new Error(`Query on ${table} failed: ${error.message}`);
    }

    return data as T;
}

