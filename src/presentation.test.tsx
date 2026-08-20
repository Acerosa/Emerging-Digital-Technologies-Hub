import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CourseSidebar } from "./components/CourseSidebar";
import { HomePage } from "./pages/HomePage";
import { WeekPage } from "./pages/WeekPage";
import { breadcrumbs } from "./page-copy";

afterEach(cleanup);

describe("L2E presentation", () => {
  it("puts Weeks 1 to 3 on the home page as the teaching starting points", () => {
    render(<HomePage root="." />);
    expect(screen.getByRole("link", { name: "Open Week 1" }).getAttribute("href")).toBe("./week-1/");
    expect(screen.getByRole("link", { name: "Open Week 2" }).getAttribute("href")).toBe("./week-2/");
    expect(screen.getByRole("link", { name: "Open Week 3" }).getAttribute("href")).toBe("./week-3/");
    expect(screen.queryByRole("link", { name: /Task 1/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /Foundations/i })).toBeNull();
    expect(screen.getAllByText(/Gateway/i).length).toBeGreaterThan(0);
  });

  it("marks the current course section on the sidebar", () => {
    const { rerender } = render(<CourseSidebar currentPage="week-2" root=".." />);
    const nav = () => screen.getByRole("navigation", { name: "Course sections" });
    expect(within(nav()).getByRole("link", { name: /Week 2/ }).getAttribute("aria-current")).toBe("page");
    expect(within(nav()).getByText("Current").closest("a")?.textContent).toMatch(/Week 2/);
    rerender(<CourseSidebar currentPage="course-guide" root=".." />);
    expect(within(nav()).getByRole("link", { name: /Course Guide/ }).getAttribute("aria-current")).toBe("page");
  });

  it("shows Gateway unit context on a week page and one session only", () => {
    render(<WeekPage weekId="week-1" root=".." />);
    expect(screen.getByText("Gateway Level 2 Digital and IT Skills")).toBeTruthy();
    expect(screen.getAllByText(/M\/618\/3683/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Pearson/i)).toBeNull();
    expect(screen.queryByText(/T Level/i)).toBeNull();
    expect(screen.getByRole("heading", { name: "Week 1 session" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /Lesson 2/i })).toBeNull();
    expect(screen.getByText(/Which of these is an example of an emerging digital technology/)).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Check answer" }).length).toBeGreaterThan(0);
  });

  it("builds breadcrumbs for week pages from the content package", () => {
    const items = breadcrumbs({
      page: "week-1",
      section: "week-1",
      root: ".."
    });
    expect(items.map((item) => item.label)).toEqual([
      "Course home",
      "Week 1: Introduction to New and Emerging Digital Technologies"
    ]);
  });
});
