declare module "@learning-platform/core/curriculum-runtime" {
  export type RuntimeWeekRecord = {
    id: string;
    teachingWeek: number;
    status: string;
    available: boolean;
    title: string;
  };

  export function isWeekAvailable(status?: string | null): boolean;
  export function overlayLiveWeekMetadata<T extends Record<string, unknown>>(
    base: T | null | undefined,
    live: T | null | undefined
  ): T | null | undefined;
  export function weeksFromPublication<T extends Record<string, unknown>>(
    basePackage: T | null | undefined,
    livePackage?: T | null
  ): RuntimeWeekRecord[];
}

declare module "@learning-platform/core" {
  export type ThemePreference = "light" | "dark" | "system";

  export interface ThemeService {
    modes: readonly ThemePreference[];
    getPreference(): ThemePreference;
    getResolvedTheme(): "light" | "dark";
    setPreference(mode: ThemePreference): unknown;
    subscribe(listener: (state: { preference: ThemePreference; resolvedTheme: "light" | "dark" }) => void): () => void;
    apply(): unknown;
    destroy(): void;
  }

  export interface LearnerState {
    status: string;
    context?: {
      firstName?: string;
      fullName?: string;
      displayName?: string;
      yearGroup?: string;
      academicYear?: string;
      contactEmail?: string;
    } | null;
  }

  export interface PlatformFacade {
    config: { hubName: string; accountPath: string };
    theme: ThemeService;
    auth: { signOut: () => Promise<void>; subscribe?: (listener: (state: { status: string; session?: { user?: { id?: string } } }) => void) => () => void };
    learner: {
      subscribe: (listener: (state: LearnerState) => void) => () => void;
    };
    state: {
      subscribe: (listener: (snapshot: { status: string }) => void) => () => void;
    };
    onboarding: unknown;
    progress?: { getProgress?: () => Promise<unknown> };
    assignments?: unknown;
    assignment?: unknown;
    enrolments?: unknown;
    enrolment?: unknown;
    features?: unknown;
    flags?: unknown;
    initialise: () => Promise<unknown>;
    destroy: () => void;
    curriculum: {
      loadLatest: () => Promise<{
        source?: string;
        package?: unknown;
        state?: { state?: string };
        publication?: unknown;
      }>;
      renderStatus?: (state: unknown) => string;
    };
  }

  export function createPlatform(options: Record<string, unknown>, dependencies?: Record<string, unknown>): PlatformFacade;
  export function createAccountDialog(options: {
    authService: unknown;
    learnerContext: unknown;
    onboardingService: unknown;
  }): { element: HTMLElement; open: (trigger?: EventTarget | null) => void; destroy?: () => void };
}

declare module "*.js";
declare module "@learning-platform/content" {
  export function validatePackage(pkg: unknown): { valid: boolean; issues?: unknown[] };
}
