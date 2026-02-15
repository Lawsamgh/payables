/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FILEMAKER_BASE_URL: string
  readonly VITE_FILEMAKER_USER: string
  readonly VITE_FILEMAKER_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

