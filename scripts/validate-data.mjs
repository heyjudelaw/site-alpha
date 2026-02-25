#!/usr/bin/env node
// Validates news.js data integrity. Use as a pre-commit check or standalone.
// Run: node scripts/validate-data.mjs

import { articles, sourcePool, desks, authors } from '../src/data/news.js';

let errors = 0;
let warnings = 0;

function error(msg) { console.error(`  ERROR: ${msg}`); errors++; }
function warn(msg) { console.warn(`  WARN:  ${msg}`); warnings++; }

console.log(`Validating ${articles.length} articles, ${sourcePool.length} sources...\n`);

// Check for duplicate slugs
const slugs = new Set();
for (const a of articles) {
  if (slugs.has(a.slug)) error(`Duplicate slug: "${a.slug}"`);
  slugs.add(a.slug);
}

// Check each article
for (const a of articles) {
  if (!a.body || !Array.isArray(a.body) || a.body.length === 0) {
    error(`${a.slug}: missing or empty body`);
  }
  if (!a.keyPoints || a.keyPoints.length === 0) {
    error(`${a.slug}: missing keyPoints`);
  }
  if (!a.sources || a.sources.length === 0) {
    warn(`${a.slug}: no linked sources`);
  }
  if (!a.title || a.title.length === 0) {
    error(`${a.slug}: missing title`);
  }
  if (!a.description || a.description.length === 0) {
    error(`${a.slug}: missing description`);
  }
  if (!a.publishedAt) {
    error(`${a.slug}: missing publishedAt`);
  }
  if (!desks.includes(a.desk)) {
    error(`${a.slug}: unknown desk "${a.desk}"`);
  }
  if (!authors.find(au => au.slug === a.authorSlug)) {
    error(`${a.slug}: unknown author "${a.authorSlug}"`);
  }
  if (!a.tags || a.tags.length === 0) {
    warn(`${a.slug}: no tags`);
  }
  // Check for source index out of bounds
  if (a.sources) {
    for (const s of a.sources) {
      if (!s || !s.url) {
        error(`${a.slug}: has an undefined source (bad sourceRef index)`);
        break;
      }
    }
  }
}

// Check for orphaned sources (not referenced by any article)
const usedSourceIndices = new Set();
for (const a of articles) {
  if (a.sources) {
    for (const s of a.sources) {
      const idx = sourcePool.indexOf(s);
      if (idx !== -1) usedSourceIndices.add(idx);
    }
  }
}
const orphaned = sourcePool.length - usedSourceIndices.size;
if (orphaned > 0) {
  warn(`${orphaned} source(s) in sourcePool are not referenced by any article`);
}

console.log('');
if (errors > 0) {
  console.error(`FAILED: ${errors} error(s), ${warnings} warning(s)`);
  process.exit(1);
} else {
  console.log(`PASSED: 0 errors, ${warnings} warning(s)`);
  console.log(`  ${articles.length} articles, ${sourcePool.length} sources, ${desks.length} desks`);
}
