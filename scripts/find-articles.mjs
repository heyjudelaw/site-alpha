#!/usr/bin/env node
// Search existing articles by keyword, tag, desk, or date range.
// Usage:
//   node scripts/find-articles.mjs seedance
//   node scripts/find-articles.mjs --tag openai
//   node scripts/find-articles.mjs --desk "Policy/IP Watch"
//   node scripts/find-articles.mjs --after 2026-02-01
//   node scripts/find-articles.mjs --after 2026-02-01 --before 2026-02-15

import { articles } from '../src/data/news.js';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage:');
  console.log('  node scripts/find-articles.mjs <keyword>        Search slugs, titles, descriptions');
  console.log('  node scripts/find-articles.mjs --tag <tag>      Search by tag');
  console.log('  node scripts/find-articles.mjs --desk <desk>    Filter by desk');
  console.log('  node scripts/find-articles.mjs --after <date>   Articles after date (YYYY-MM-DD)');
  console.log('  node scripts/find-articles.mjs --before <date>  Articles before date');
  console.log(`\nTotal articles: ${articles.length}`);
  process.exit(0);
}

let filters = [];
let i = 0;
while (i < args.length) {
  if (args[i] === '--tag' && args[i + 1]) {
    const tag = args[i + 1].toLowerCase();
    filters.push(a => a.tags.some(t => t.includes(tag)));
    i += 2;
  } else if (args[i] === '--desk' && args[i + 1]) {
    const desk = args[i + 1].toLowerCase();
    filters.push(a => a.desk.toLowerCase().includes(desk));
    i += 2;
  } else if (args[i] === '--after' && args[i + 1]) {
    const after = new Date(args[i + 1]);
    filters.push(a => new Date(a.publishedAt) >= after);
    i += 2;
  } else if (args[i] === '--before' && args[i + 1]) {
    const before = new Date(args[i + 1]);
    filters.push(a => new Date(a.publishedAt) < before);
    i += 2;
  } else {
    const kw = args[i].toLowerCase();
    filters.push(a =>
      a.slug.includes(kw) ||
      a.title.toLowerCase().includes(kw) ||
      a.description.toLowerCase().includes(kw)
    );
    i++;
  }
}

const results = articles.filter(a => filters.every(f => f(a)));
results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

if (results.length === 0) {
  console.log('No matching articles found.');
} else {
  console.log(`Found ${results.length} article(s):\n`);
  for (const a of results) {
    console.log(`  ${a.publishedAt.slice(0, 10)}  ${a.slug}`);
    console.log(`  ${a.desk} | ${a.tags.join(', ')}`);
    console.log(`  ${a.title}\n`);
  }
}
