# Contributing to AI Tool Hunter

Thanks for your interest in improving AI Tool Hunter. Contributions of all sizes are welcome — bug fixes, new features, docs, and dataset improvements.

## Workflow

1. **Fork** the repo and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Make your changes.** Keep PRs focused — one feature or fix per PR.
3. **Test locally** with `npm run dev` and `npm run lint` before opening a PR.
4. **Open a Pull Request** against `main` with a clear description of what changed and why.
5. All PRs are reviewed before merging — no direct pushes to `main`.

## Reporting issues

Use GitHub Issues for bugs and feature requests. Include repro steps for bugs where possible.

## Code style

- TypeScript, App Router conventions (Next.js).
- Run `npm run lint` before submitting.
- Match existing component patterns in `components/` and `lib/`.

## Scope

This repo is the main web app. The MCP server lives in a separate repo: [ai-tool-hunter-mcp](https://github.com/VishalsWorkspace/ai-tool-hunter-mcp).

By contributing, you agree your contributions are licensed under the project's [MIT License](./LICENSE).
