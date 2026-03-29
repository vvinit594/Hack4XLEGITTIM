/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Prisma API base; use `=` (empty) in dev to use Vite `/api` proxy */
  readonly VITE_API_URL?: string
  /** BedPulse FastAPI (forecast) e.g. http://localhost:8001 */
  readonly VITE_AI_SERVICE_URL?: string
  /** Demo ward UUID; must match ai_service / Supabase seed */
  readonly VITE_DEMO_WARD_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
