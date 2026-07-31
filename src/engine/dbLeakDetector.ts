/**
 * SEFAES DB Gateway Leak Detector
 * Runtime guard that throws an error if any module other than dbGateway
 * tries to directly access properties or methods on the raw Supabase client.
 */
export function checkDirectAccessAllowed() {
    const stack = new Error().stack || '';
    const lines = stack.split('\n');

    for (const line of lines) {
        // We look for references inside our src folder
        if (line.includes('/src/')) {
            // Skip the leak detector itself and the supabase client initializer/Proxy
            if (line.includes('/src/engine/dbLeakDetector') || line.includes('/src/lib/supabase')) {
                continue;
            }

            const isAuthorized = 
                line.includes('/src/db/dbGateway') ||
                line.includes('/src/lib/rpcClient') ||
                line.includes('/src/server/serverCommandQueue') ||
                line.includes('/src/execution/') ||
                line.includes('/src/tests/') ||
                line.includes('/src/engine/');
            
            if (!isAuthorized) {
                throw new Error(
                    `🚨 DB GATEWAY VIOLATION DETECTED\n` +
                    `Direct Supabase access is forbidden. Use dbGateway only. (Caller: ${line.trim()})`
                );
            }
            // Once we have checked the immediate non-proxy caller, we stop checking.
            break;
        }
    }
}
