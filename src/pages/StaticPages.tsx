import { EmptyState } from "@learning-platform/ui";
import { createSitePath } from "../paths";

export function ResourcesPage({ root }: { root: string }) {
  return (
    <section className="study-card" aria-labelledby="resources-heading">
      <h2 id="resources-heading">Course resources</h2>
      <p>References and supporting material for Exploring New and Emerging Digital Technologies will be added here.</p>
      <EmptyState
        heading="Resources will be added here"
        message="Course documents and templates are not in this hub component yet."
      />
      <div className="related-links">
        <a href={createSitePath(root, "course-guide/")}>Course Guide</a>
        <a href={createSitePath(root, "help/")}>Help</a>
      </div>
    </section>
  );
}

export function HelpPage() {
  return (
    <div className="study-stack">
      <section className="study-card" aria-labelledby="navigation-heading">
        <h2 id="navigation-heading">Finding a section</h2>
        <p>On a computer, use the Course sections menu beside the page. On a smaller screen, open the Menu button at the top.</p>
      </section>
      <section className="study-card" aria-labelledby="keyboard-heading">
        <h2 id="keyboard-heading">Keyboard access</h2>
        <p>Press Tab to move through links and controls. Use the skip link to move directly to the main content.</p>
      </section>
      <section className="study-card" aria-labelledby="account-heading">
        <h2 id="account-heading">Account and progress</h2>
        <p>Teaching pages remain readable without an account. Progress, enrolment and submissions require authentication. Passwords are sent only to Supabase Auth.</p>
      </section>
    </div>
  );
}

export function AccountPage() {
  return (
    <section className="study-card">
      <h2>Sign in or register</h2>
      <p>Use the Sign in control in the header. The shared Learning Platform account dialog handles sign in, registration and onboarding.</p>
    </section>
  );
}
