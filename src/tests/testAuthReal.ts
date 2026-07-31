import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual env reading
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

let supabaseUrl = '';
let supabaseAnonKey = '';

for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
        supabaseUrl = trimmed.substring('VITE_SUPABASE_URL='.length);
    }
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
        supabaseAnonKey = trimmed.substring('VITE_SUPABASE_ANON_KEY='.length);
    }
}

console.log("Supabase URL:", supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'priyaagwash@gmail.com',
        password: 'Branama147'
    });

    if (error) {
        console.error("Auth failed:", error.message);
    } else {
        console.log("Auth success! User ID:", data.user?.id);
        console.log("Session:", data.session ? "Active" : "None");
    }
}

testAuth();
