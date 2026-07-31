const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env.VITE_SUPABASE_URL
  : (process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co');

const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : (process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key');

if (!supabaseUrl || supabaseUrl.trim() === '' || supabaseUrl.includes('placeholder') && !process.env.TEST_ENV) {
  const errorMsg = "CRITICAL: VITE_SUPABASE_URL environment variable is missing or has a placeholder value. Application boot halted.";
  console.error(errorMsg);
  throw new Error(errorMsg);
}

if (!supabaseAnonKey || supabaseAnonKey.trim() === '' || (supabaseAnonKey === 'placeholder-key' || supabaseAnonKey.includes('placeholder')) && !process.env.TEST_ENV) {
  const errorMsg = "CRITICAL: VITE_SUPABASE_ANON_KEY environment variable is missing or has a placeholder value. Application boot halted.";
  console.error(errorMsg);
  throw new Error(errorMsg);
}

export const env = {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey,
};

