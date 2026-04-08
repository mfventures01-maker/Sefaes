/// \u003creference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY?: string;
    readonly GEMINI_API_KEY?: string;
    readonly VITE_DEBUG_ROLE_SWITCH?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
