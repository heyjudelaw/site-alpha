#!/usr/bin/env node
// Search existing sources by keyword to find indices and avoid duplicates.
// Usage: node scripts/find-source.mjs "techcrunch"
//        node scripts/find-source.mjs "bloomberg" "tier 1"

import { sourcePool } from '../src/data/news.js';

const query = process.argv.slice(2).join(' ').toLowerCase();
if (!query) {
  console.log('Usage: node scripts/find-source.mjs <keyword>');
  console.log('Example: node scripts/find-source.mjs "techcrunch"');
  console.log(`\nTotal sources: ${sourcePool.length} (indices 0-${sourcePool.length - 1})`);
  console.log(`Next available index: ${sourcePool.length}`);
  process.exit(0);
}

const matches = sourcePool
  .map((s, i) => ({ ...s, index: i }))
  .filter(s => s.title.toLowerCase().includes(query) || s.url.toLowerCase().includes(query) || s.tier.toLowerCase().includes(query));

if (matches.length === 0) {
  console.log(`No sources matching "${query}".`);
  console.log(`Next available index: ${sourcePool.length}`);
} else {
  console.log(`Found ${matches.length} source(s) matching "${query}":\n`);
  for (const m of matches) {
    console.log(`  [${m.index}] ${m.title}`);
    console.log(`       ${m.url}`);
    console.log(`       ${m.tier}\n`);
  }
}
