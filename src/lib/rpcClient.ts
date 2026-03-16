// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC RPC CLIENT
// Single communication gateway to backend
// All mutations MUST pass through this function
// ──────────────────────────────────────────────

import { supabase } from './supabase';

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
    const { data, error } = await supabase.rpc(functionName, payload || {});

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
    query: (builder: ReturnType<typeof supabase.from>) => any
): Promise<T> {
    const builder = supabase.from(table);
    const { data, error } = await query(builder);

    if (error) {
        console.error(`[QUERY_FAILURE] ${table}:`, error.message);
        throw new Error(`Query on ${table} failed: ${error.message}`);
    }

    return data as T;
}
