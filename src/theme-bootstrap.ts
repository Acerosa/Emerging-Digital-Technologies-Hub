try {
  const stored = window.localStorage.getItem("learning-platform.theme.v1");
  const preference = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  const resolved = preference === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : preference;
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.setAttribute("data-theme-preference", preference);
} catch {
  document.documentElement.setAttribute("data-theme", "light");
  document.documentElement.setAttribute("data-theme-preference", "system");
}
