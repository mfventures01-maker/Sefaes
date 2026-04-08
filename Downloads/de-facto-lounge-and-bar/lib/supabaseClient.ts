
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[SUPABASE] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Sync will be disabled.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

// Helper to check connection
export const checkSupabaseConnection = async () => {
    try {
        const { count, error } = await supabase
            .from('defacto_transactions')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return { connected: true, count };
    } catch (err) {
        return { connected: false, error: err };
    }
};
