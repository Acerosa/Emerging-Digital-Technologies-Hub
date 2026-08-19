import react from "@vitejs/plugin-react";
import { cpSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { defineConfig } from "vite";

function collectHtml(directory: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    if (entry === "node_modules" || entry === "dist" || entry === "test" || entry === "tests") continue;
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) collectHtml(full, acc);
    else if (entry === "index.html") acc.push(full);
  }
  return acc;
}

function htmlInputs() {
  return Object.fromEntries(
    collectHtml(process.cwd()).map((file) => {
      const relative = file.replace(process.cwd() + "/", "");
      const name = relative === "index.html" ? "home" : relative.replace(/\/index\.html$/, "").replaceAll("/", "-");
      return [name, file];
    })
  );
}

function pagesAssets() {
  return {
    name: "learning-platform-pages-assets",
    closeBundle() {
      const dist = resolve("dist");
      cpSync(resolve("content/l2e-exploring-emerging-digital-technologies"), resolve(dist, "content/l2e-exploring-emerging-digital-technologies"), { recursive: true });
      writeFileSync(resolve(dist, ".nojekyll"), "");
    }
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), pagesAssets()],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: htmlInputs()
    }
  }
});
