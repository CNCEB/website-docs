# Repository Guidelines

## Project Structure & Module Organization

This repository is a Next.js 16 documentation site built with Fumadocs.

- `src/app/` contains App Router pages, layouts, API routes, and generated-text routes. Documentation rendering is under `src/app/docs/`; the landing page is in `src/app/(home)/`.
- `src/components/` holds reusable React/MDX components.
- `src/lib/` contains the Fumadocs source adapter, route constants, layout configuration, and shared utilities. Use the `@/` alias for imports from `src`.
- `content/docs/` is the documentation source. Add pages as `.mdx` files with front matter; keep navigation metadata alongside content when needed.
- `public/` is for static assets. Do not edit generated `.next/` or `.source/` directories.

## Build, Test, and Development Commands

Use pnpm (the repository includes `pnpm-lock.yaml`).

```bash
pnpm dev          # run the local site at http://localhost:3000
pnpm lint         # run Next.js ESLint rules
pnpm types:check  # generate Next types and run TypeScript checking
pnpm build        # produce a production build
pnpm start        # serve a completed production build
```

Run `pnpm lint` and `pnpm types:check` before submitting changes. There is no automated unit-test suite currently; verify documentation and UI changes locally, then use `pnpm build` for route/build validation.

## Coding Style & Naming Conventions

Write TypeScript with strict typing and React function components. Match the surrounding file’s formatting and quote style; existing files use two-space indentation, semicolons, trailing commas, and both single- and double-quoted imports. Name React components in `PascalCase`, utilities in `camelCase`, and Next.js special files by framework convention (for example, `page.tsx`, `layout.tsx`, and `route.ts`). Keep documentation filenames lowercase and descriptive, such as `getting-started.mdx`.

## Commit & Pull Request Guidelines

Use concise Conventional Commit-style subjects. Current history uses scoped Chinese subjects such as `feat(站点定制): 添加页面元数据`; use an appropriate type and optional scope, e.g. `docs: add deployment guide` or `fix(search): handle empty queries`.

Keep each commit focused. Pull requests should explain the user-visible change, link the relevant issue when one exists, list validation commands run, and include screenshots for layout or visual documentation changes. Do not commit local environment files, generated output, or secrets.
