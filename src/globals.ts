import { APP_CONFIG } from "./config";
import { SUPABASE_CONFIG } from "./supabase-config";

declare global {
  interface Window {
    APP_CONFIG: typeof APP_CONFIG;
    SUPABASE_CONFIG: typeof SUPABASE_CONFIG;
    LearningPlatform?: {
      platform: unknown;
      coreVersion: string;
    };
    __lpPackage?: unknown;
    __lpPublishedCurriculum?: boolean;
  }
}

window.APP_CONFIG = APP_CONFIG;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
