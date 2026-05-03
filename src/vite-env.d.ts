/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_LIFF_ID: string;
  readonly VITE_ADMIN_LIFF_ID: string;
  readonly VITE_DEV_MOCK_AUTH: string;
  readonly VITE_DEV_MOCK_ADMIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
