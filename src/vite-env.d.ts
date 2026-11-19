/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_PHONE: string
  readonly VITE_ADMIN_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
