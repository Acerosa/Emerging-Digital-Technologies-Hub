declare module "@learning-platform/core/advanced" {
  export function createFormativeMarkingService(options?: {
    auth?: { isSignedIn?: () => boolean };
    api?: { markFormativeResponse?: (payload: unknown) => Promise<unknown> };
    crypto?: Crypto;
    resolveFormativeContract?: unknown;
  }): {
    markBlock: (input: Record<string, unknown>) => Promise<{
      completed?: boolean;
      correct?: boolean | null;
      status?: string;
      score?: { correct: number; total: number };
      requiresReview?: boolean;
    }>;
  };
}
