# Exploring New and Emerging Digital Technologies

Learner hub for Gateway Qualifications Level 2 Certificate in Digital and IT Skills (`603/6502/X`), unit Exploring New and Emerging Digital Technologies (`M/618/3683`).

- Hub id: `l2e-exploring-emerging-digital-technologies`
- Repository: `Acerosa/Emerging-Digital-Technologies-Hub`
- Course: `gateway-level-2-digital-it-skills`
- Delivery: one 1.5-hour session per week
- First cut: hub shell plus Weeks 1 to 3 (LO1 / AC 1.1), formative only

Scaffolded by `@learning-platform/cli`. Runtime wiring follows the week-based Core/UI contract. Teaching copy is Gateway, not Pearson / T Level.

## Local development

Place this hub beside the reviewed platform packages:

```text
learning-platform-core/
learning-platform-ui/
learning-platform-content/
l2e-exploring-emerging-digital-technologies-hub/
```

The GitHub repository name is `Emerging-Digital-Technologies-Hub`. The local folder can stay beside the other packages.

Then:

```bash
npm install
npm run dev
npm test
```

This hub conforms to Hub Security Baseline v1. Learner bundles exclude authoritative marking data. See `learning-platform-core` `docs/hub-security-baseline-v1.md`.

Dependencies use `file:` siblings. CI checks out the same packages at reviewed tags before `npm ci`.

## After creation

1. Push to `Acerosa/Emerging-Digital-Technologies-Hub`.
2. Enable GitHub Pages from the Actions workflow.
3. Apply the lightweight branch-protection ruleset separately (`docs/github-protection.md`).
4. Register `learning-platform-hub.json` in Admin after the Gateway course key exists. The CLI never writes to hosted Supabase.
