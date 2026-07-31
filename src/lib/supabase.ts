import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { checkDirectAccessAllowed } from '../engine/dbLeakDetector';

const rawSupabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

export const supabaseStubs: Record<string | symbol, any> = {};

export const supabase = new Proxy(rawSupabase, {
    get(target, prop, receiver) {
        checkDirectAccessAllowed();
        if (prop in supabaseStubs) {
            return supabaseStubs[prop];
        }
        return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value) {
        supabaseStubs[prop] = value;
        return true;
    },
    defineProperty(target, prop, descriptor) {
        supabaseStubs[prop] = descriptor.value;
        return true;
    }
});
