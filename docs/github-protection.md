# Branch protection

Do not apply repository rulesets from `lp create hub`.

After `Acerosa/Emerging-Digital-Technologies-Hub` exists, apply the lightweight production-branch policy used by the Learning Platform:

- protect the default production branch
- require a pull request (0 reviewers)
- require reliable PR checks only
- block force pushes and branch deletion
- keep owner/admin bypass

The reusable script lives in `learning-platform-core`:

```bash
../learning-platform-core/scripts/github/apply-main-protection.sh --plan
```

Do not enable signed commits, extra reviewers, or "do not allow bypassing".
