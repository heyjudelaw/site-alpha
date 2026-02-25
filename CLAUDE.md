# CLAUDE.md — VideoGenNews (site-alpha)

## What this project is

An Astro static news site about AI video generation, deployed to GitHub Pages at **videogennews.com**. All article data lives in a single file: `src/data/news.js`.

## Deployment

Push to `main` triggers GitHub Actions (`npm ci && npm run build`) which deploys `dist/` to GitHub Pages. Custom domain via `public/CNAME`. No manual steps needed — just push and wait ~30s.

## Architecture

### Single data file: `src/data/news.js`

Everything is driven by this one file. It contains, in order:

1. **`authors`** — 9 authors with slugs, roles, bios
2. **`sourcePool`** — Array of `{ title, url, tier }` objects. Sources are referenced by array index in story seeds.
3. **`imagePool`** — Unsplash images assigned round-robin to articles
4. **`storySeeds`** — Array of article metadata. Each seed has: `slug`, `title`, `description`, `publishedAt`, `updatedAt`, `desk`, `contentType`, `evidenceScore` (1-5), `riskScore` (1-5), `authorSlug`, `tags`, `sourceRefs` (indices into sourcePool), `hook`, `angle`, `pulse`
5. **Helper functions** — `buildBody()`, `buildKeyPoints()`, etc. generate full article text from seeds
6. **`articles`** export — Maps seeds through helpers to produce complete article objects
7. **`desks`** export — Derived from articles

### Key conventions

- **Source tiers**: Tier 1 (primary/official), Tier 2 (secondary/reporting), Tier 3 (ecosystem), Tier 4 (social)
- **Evidence scores**: 1 (low) to 5 (high confidence with strong triangulation)
- **Risk scores**: 1 (limited downside) to 5 (material legal/platform risk)
- **Author rotation**: `deskAuthorRotation` maps desks to author pools; the `authorSlug` in a seed is a suggestion but gets rotated
- **Body generation**: `buildBody()` creates the article body from the seed's `hook`, `angle`, `pulse`, and source metadata. Articles with `customBody` arrays bypass `buildBody()`.
- **Dates**: Always ISO 8601 UTC (`2026-02-25T14:00:00Z`)

### 10 Editorial desks

Model Wire, Policy/IP Watch, Workflow Lab, Benchmark Lab, Toolchain Desk, Distribution Intelligence, Verification Desk, Research-to-Product, Trend Radar, VideoGenNews Desk

## How to add articles

### Step 1: Add sources to `sourcePool`

Append new source objects to the end of the `sourcePool` array. Note the index (0-based) for use in `sourceRefs`.

```js
{
  title: 'TechCrunch: Descriptive title of the source',
  url: 'https://example.com/article',
  tier: 'Tier 2'
}
```

### Step 2: Add story seeds to `storySeeds`

Append new seed objects to the end of the `storySeeds` array.

```js
{
  slug: 'kebab-case-unique-slug',
  title: 'Headline Style Title Under 100 Characters Ideally',
  description: 'One-sentence summary used in meta tags and key points.',
  publishedAt: '2026-02-25T14:00:00Z',
  updatedAt: '2026-02-25T19:30:00Z',
  desk: 'Model Wire',
  contentType: 'News',           // or 'Analysis'
  evidenceScore: 4,
  riskScore: 3,
  authorSlug: 'nora-ellis',     // gets rotated by desk
  tags: ['tag1', 'tag2', 'tag3'],
  sourceRefs: [90, 91, 92],     // indices into sourcePool
  hook: 'Why this matters right now — one punchy sentence.',
  angle: 'The deeper structural implication — what this changes.',
  pulse: 'What to watch next — the forward-looking signal.'
}
```

### Step 3: Validate

```bash
# Quick data check
node -e 'import("./src/data/news.js").then(m => { console.log("articles:", m.articles.length, "sources:", m.sourcePool.length); });'

# Full build
npx astro build
```

## Avoiding duplicates

Before writing new articles, always check for existing coverage:

```bash
# List all current slugs
node -e 'import("./src/data/news.js").then(m => m.articles.forEach(a => console.log(a.publishedAt.slice(0,10), a.slug)));'

# Search for a topic
node -e 'import("./src/data/news.js").then(m => m.articles.filter(a => a.tags.some(t => t.includes("seedance"))).forEach(a => console.log(a.slug)));'
```

## Style guide for articles

- **Hook**: One sentence. Present tense. States why this story moved from watchlist to coverage.
- **Angle**: One sentence. Explains the structural implication beyond the headline.
- **Pulse**: One sentence. Forward-looking. Starts with "Watch for..." or "Expect..."
- **Description**: Factual summary. No opinion. Used in meta tags.
- **Tags**: 3-5 lowercase, hyphenated. Include company names, topic categories.
- **Tone**: Direct, analytical, no hype. VideoGenNews writes like a wire service with editorial judgment — facts first, interpretation clearly separated.

## Current article count

As of 2026-02-25: **100 articles**, **122 sources**, **10 desks**

### Coverage date range

- Oldest: 2025-12-01 (kling-o1-omni-launch-unified-model)
- Newest: 2026-02-25 (canada-summons-openai-tumbler-ridge-shooting)

### Recent articles (last 10)

Run this to see the latest:
```bash
node -e 'import("./src/data/news.js").then(m => { var s = m.articles.slice().sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt)); s.slice(0,10).forEach(a => console.log(a.publishedAt.slice(0,10), a.slug)); });'
```
