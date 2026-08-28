import { createPlatform } from "@learning-platform/core";
import { createClient } from "@supabase/supabase-js";
import { validatePackage } from "@learning-platform/content";
import { APP_CONFIG } from "./config";
import { configureBundledPackage } from "./curriculum/runtime-weeks";
import { createSitePath } from "./paths";
import { SUPABASE_CONFIG } from "./supabase-config";

let bundledReady: Promise<import("./curriculum/from-package").ContentPackage> | null = null;

export function ensureBundledConfigured() {
  if (!bundledReady) {
    bundledReady = import("../content/l2e-exploring-emerging-digital-technologies/package.json").then((mod) => {
      configureBundledPackage(mod.default as import("./curriculum/from-package").ContentPackage);
      return mod.default as import("./curriculum/from-package").ContentPackage;
    });
  }
  return bundledReady;
}

function curriculumAwareFetch(input: RequestInfo | URL, init?: RequestInit) {
  const url = String(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
  const requestInit: RequestInit = { ...init };
  if (url.includes("published_curriculum_package")) {
    requestInit.cache = "no-store";
    requestInit.headers = {
      ...(init?.headers || {}),
      "Cache-Control": "no-cache"
    };
  }
  return fetch(input, requestInit).then(async (response) => {
    if (url.includes("published_curriculum_package") && !response.ok) {
      let body = "";
      try { body = await response.clone().text(); } catch {}
      console.warn("L2E_CURRICULUM_RPC_FAILED", {
        status: response.status,
        hub: APP_CONFIG.hubId,
        course: APP_CONFIG.courseKey,
        body
      });
    }
    return response;
  });
}

export function createHubPlatform(root: string, createPlatformFn = createPlatform) {
  ensureBundledConfigured();
  const client = createClient(SUPABASE_CONFIG.projectUrl, SUPABASE_CONFIG.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: { fetch: curriculumAwareFetch }
  });
  const platform = createPlatformFn({
    hubCode: APP_CONFIG.hubId,
    courseKey: APP_CONFIG.courseKey,
    hubName: APP_CONFIG.siteName,
    platformVersion: APP_CONFIG.coreVersion,
    accountPath: createSitePath(root, "account/"),
    supabase: {
      projectUrl: SUPABASE_CONFIG.projectUrl,
      publishableKey: SUPABASE_CONFIG.publishableKey
    },
    navigation: APP_CONFIG.navigation.map((item) => ({
      ...item,
      path: item.id === "home" ? createSitePath(root) : createSitePath(root, item.path)
    })),
    navigationMode: "as-supplied",
    features: APP_CONFIG.features,
    theme: APP_CONFIG.theme
  }, {
    supabaseClient: client,
    localStorage: typeof window !== "undefined" ? window.localStorage : undefined,
    validatePackage,
    fetch: curriculumAwareFetch,
    loadBundled: () => import("../content/l2e-exploring-emerging-digital-technologies/package.json").then((mod) => mod.default)
  });

  return Object.freeze({
    ...platform,
    client,
    assignment: platform.assignments || platform.assignment,
    enrolment: platform.enrolments || platform.enrolment,
    flags: platform.features || platform.flags
  });
}

export type HubPlatform = ReturnType<typeof createHubPlatform>;
