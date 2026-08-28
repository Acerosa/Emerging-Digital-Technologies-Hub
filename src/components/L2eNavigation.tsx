import { WeekAccessLink, type WeekAccessRecord } from "@learning-platform/ui";
import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import type { ThemeControl } from "@learning-platform/ui";

export type L2eNavigationItem = {
  id: string;
  label: string;
  path: string;
  enabled?: boolean;
  runtimeWeek?: WeekAccessRecord | null;
};

export type L2eNavigationProps = {
  items: L2eNavigationItem[];
  currentId?: string;
  currentIds?: string[];
  brandTitle: string;
  brandTagline?: string;
  homeHref?: string;
  theme?: ThemeControl | null;
  actions?: ReactNode;
  listId?: string;
};

export function L2eNavigation({
  items,
  currentId = "home",
  currentIds = [],
  brandTitle,
  brandTagline,
  homeHref,
  theme = null,
  actions,
  listId
}: L2eNavigationProps): ReactNode {
  const generatedId = useId();
  const navListId = listId || `lp-navigation-list-${generatedId}`;
  const [open, setOpen] = useState(false);
  const current = new Set([currentId, ...currentIds].filter(Boolean));
  const home = items.find((item) => item.id === "home" && item.enabled !== false);
  const visible = items.filter((item) => item.enabled !== false);

  useEffect(() => {
    function onEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  function onNavKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      const toggle = event.currentTarget.querySelector<HTMLButtonElement>(".lp-navigation__toggle");
      toggle?.focus();
    }
  }

  return (
    <nav className="lp-navigation" aria-label="Main navigation" onKeyDown={onNavKeyDown}>
      <div className="lp-navigation__bar">
        <a className="lp-navigation__brand" href={homeHref || home?.path || "./"}>
          <span className="lp-navigation__brand-title">{brandTitle}</span>
          {brandTagline ? <span className="lp-navigation__brand-tagline">{brandTagline}</span> : null}
        </a>
        <button
          className="lp-button lp-button--secondary lp-navigation__toggle"
          type="button"
          aria-expanded={open}
          aria-controls={navListId}
          aria-label={open ? "Close main menu" : "Open main menu"}
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
        <ul
          className="lp-navigation__list"
          id={navListId}
          data-open={open ? "true" : "false"}
        >
          {visible.map((item) => (
            <li key={item.id}>
              {item.runtimeWeek ? (
                <WeekAccessLink
                  week={item.runtimeWeek}
                  href={item.path}
                  className="lp-navigation__link"
                  lockedClassName="lp-navigation__link lp-navigation__link--locked"
                  renderLink={({ href, children, className }) => (
                    <a
                      className={className}
                      href={href}
                      aria-current={current.has(item.id) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      {children}
                    </a>
                  )}
                >
                  {item.label}
                </WeekAccessLink>
              ) : (
                <a
                  className="lp-navigation__link"
                  href={item.path}
                  aria-current={current.has(item.id) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
        {theme ? (
          <label className="lp-theme-control">
            Theme
            <select
              aria-label="Theme preference"
              value={theme.preference}
              onChange={(event) => theme.onChange(event.target.value as ThemeControl["preference"])}
            >
              {theme.modes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode[0].toUpperCase() + mode.slice(1)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {actions ? <div className="lp-navigation__actions">{actions}</div> : null}
      </div>
    </nav>
  );
}
