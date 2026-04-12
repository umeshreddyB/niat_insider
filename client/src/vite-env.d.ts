/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Set `true` when using `VITE_API_BASE_URL=http://localhost:5000` for local API */
  readonly VITE_USE_LOCAL_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
