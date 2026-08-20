import { createContext, useContext, type ReactNode } from "react";
import { useContentPackage } from "../hooks/useContentPackage";

type ContentValue = ReturnType<typeof useContentPackage>;

const ContentPackageContext = createContext<ContentValue | null>(null);

export function ContentPackageProvider({
  children,
  platform
}: {
  children: ReactNode;
  platform?: {
    curriculum?: {
      loadLatest: () => Promise<unknown>;
    };
  } | null;
}) {
  const value = useContentPackage(platform);
  return <ContentPackageContext.Provider value={value}>{children}</ContentPackageContext.Provider>;
}

export function useLoadedContent() {
  const value = useContext(ContentPackageContext);
  if (!value) throw new Error("ContentPackageProvider required");
  return value;
}
