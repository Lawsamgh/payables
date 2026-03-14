/// <reference types="vite/client" />

declare module "pdfmake/build/pdfmake";
declare module "pdfmake/build/vfs_fonts";

interface ImportMetaEnv {
  readonly VITE_FILEMAKER_BASE_URL: string
  readonly VITE_FILEMAKER_USER: string
  readonly VITE_FILEMAKER_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

