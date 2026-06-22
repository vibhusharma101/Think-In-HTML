# Publishing Think-In-HTML to npm

This is how you make `npx think-in-html` work for everyone (the one manual step).
You need an [npmjs.com](https://www.npmjs.com/signup) account.

## First-time publish

```bash
# 1. Log in to npm (opens a browser, or prompts in the terminal)
npm login

# 2. Confirm what will be published — should list only:
#    bin/ core/ adapters/ README.md LICENSE package.json
npm pack --dry-run

# 3. Publish (the name `think-in-html` is unscoped and public)
npm publish
```

That's it. Within a minute, anyone can run:

```bash
npx think-in-html init
```

## Releasing a new version

npm refuses to publish over an existing version, so bump first:

```bash
# Pick one — updates package.json and creates a git tag:
npm version patch   # 1.0.0 -> 1.0.1  (bug fixes)
npm version minor   # 1.0.0 -> 1.1.0  (new features, backward compatible)
npm version major   # 1.0.0 -> 2.0.0  (breaking changes)

git push --follow-tags
npm publish
```

## Verifying the published package

```bash
npm view think-in-html              # see the live version + metadata
npx think-in-html@latest --version  # run the published copy
```

## Notes

- **Zero dependencies**, so there's no security/lockfile surface to audit at publish time.
- The `files` allowlist in `package.json` controls the tarball — `.vii/`, working
  `analysis.json` files, and generated `*.html` are never published.
- If the name `think-in-html` is ever taken before you publish, switch to a scoped name
  (`@yourname/think-in-html`) and publish with `npm publish --access public`.
