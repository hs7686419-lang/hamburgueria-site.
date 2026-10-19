/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORM_ENDPOINT?: string
  readonly VITE_WHATSAPP_NUMBER?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
