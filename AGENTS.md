# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/`: route-based Astro pages. Use lowercase paths; dynamic routes use brackets (for example, `news/[slug].astro` and `authors/[slug].astro`).
- `src/components/`: reusable UI blocks in PascalCase (for example, `ArticleCard.astro`, `TrendPulse.astro`).
- `src/layouts/`: shared shells such as `BaseLayout.astro` for metadata and schema defaults.
- `src/data/news.js`: newsroom content source (articles, authors, desks, source pool). Keep editorial facts aligned with primary sources.
- `src/styles/global.css`: global styles.
- `public/`: static files such as `robots.txt`.
- `dist/`: generated output from builds; do not edit manually.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start local Astro dev server with hot reload.
- `npm run build`: create production build in `dist/`.
- `npm run preview`: serve the built site for final QA.

## Coding Style & Naming Conventions
- Use 2-space indentation and ES module syntax.
- Components and layouts use PascalCase filenames.
- Route files stay lowercase; slug URLs should be kebab-case.
- JavaScript identifiers and content keys use camelCase (`publishedAt`, `commentCountLabel`).
- Keep dates and updates consistent and render with explicit timezone handling.

## Testing Guidelines
- No automated test framework is configured yet.
- Required pre-PR checks: `npm run build` and a local smoke test via `npm run preview`.
- Manually verify core routes: `/`, `/news/`, `/news/[slug]/`, `/authors/`, `/desks/[slug]/`, `/sitemap.xml`, and `/sitemap-index.xml`.
- For content/data edits, validate source URLs, author slugs, and structured-data output.

## Commit & Pull Request Guidelines
- This workspace snapshot has no `.git` metadata; use Conventional Commits by default (`feat:`, `fix:`, `chore:`).
- Keep commits focused: separate data/content updates from layout or styling refactors.
- PRs should include a short summary, impacted routes, screenshots for UI changes, and references for source-driven content updates.
- Call out SEO/schema/canonical URL changes explicitly in the PR description.
