import { Callout } from "@learning-platform/ui";
import { createSitePath } from "../paths";

export function CourseGuidePage({ root }: { root: string }) {
  return (
    <div className="study-stack">
      <section className="study-card" aria-labelledby="structure-heading">
        <h2 id="structure-heading">Course structure</h2>
        <p>
          Follow the weekly teaching sequence for L2 E Computing. Each week has one
          1.5-hour session.
        </p>
        <ul>
          <li>Week 1: Current and Emerging Technology, including Mobile</li>
          <li>Week 2: Internet of Things, RFID, NFC and Wearables</li>
          <li>Week 3: Cloud Technology, SaaS, IaaS, PaaS and DaaS</li>
        </ul>
        <p>
          Later weeks stay in the scheme of learning until they are authored in this
          hub.
        </p>
      </section>
      <section className="study-card" aria-labelledby="start-heading">
        <h2 id="start-heading">Start the course</h2>
        <p>Week 1 is the current teaching week.</p>
        <a className="text-link" href={createSitePath(root, "week-1/")}>Open Week 1</a>
      </section>
      <Callout
        tone="info"
        title="How to use this hub"
        message="Use Course sections beside the page on a larger screen, or the Menu button at the top on a smaller screen."
      />
    </div>
  );
}
