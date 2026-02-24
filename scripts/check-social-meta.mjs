import fs from 'node:fs';
import path from 'node:path';

const distRoot = path.resolve('dist');

const requiredCommonTags = [
  ['property', 'og:title'],
  ['property', 'og:description'],
  ['property', 'og:url'],
  ['property', 'og:image'],
  ['property', 'og:image:width'],
  ['property', 'og:image:height'],
  ['property', 'og:image:type'],
  ['name', 'twitter:card'],
  ['name', 'twitter:title'],
  ['name', 'twitter:description'],
  ['name', 'twitter:image'],
  ['name', 'twitter:image:alt']
];

const requiredArticleTags = [
  ['property', 'article:published_time'],
  ['property', 'article:modified_time'],
  ['property', 'article:author']
];

const walkHtmlFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkHtmlFiles(fullPath);
    return entry.isFile() && fullPath.endsWith('.html') ? [fullPath] : [];
  });

const getMetaContent = (html, attrName, attrValue) => {
  const escaped = attrValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<meta[^>]*${attrName}="${escaped}"[^>]*content="([^"]*)"[^>]*>`, 'i');
  return html.match(pattern)?.[1] ?? null;
};

const isAbsoluteHttpsUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

if (!fs.existsSync(distRoot)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = walkHtmlFiles(distRoot);
const problems = [];

for (const file of htmlFiles) {
  const relPath = path.relative(distRoot, file);
  const html = fs.readFileSync(file, 'utf8');
  const isArticlePage = /^news\/[^/]+\/index\.html$/.test(relPath);

  for (const [attrName, attrValue] of requiredCommonTags) {
    const value = getMetaContent(html, attrName, attrValue);
    if (!value) problems.push(`${relPath}: missing meta ${attrName}="${attrValue}"`);
  }

  if (isArticlePage) {
    for (const [attrName, attrValue] of requiredArticleTags) {
      const value = getMetaContent(html, attrName, attrValue);
      if (!value) problems.push(`${relPath}: missing article meta ${attrName}="${attrValue}"`);
    }
  }

  const ogUrl = getMetaContent(html, 'property', 'og:url');
  const ogImage = getMetaContent(html, 'property', 'og:image');
  const twImage = getMetaContent(html, 'name', 'twitter:image');
  const ogWidth = getMetaContent(html, 'property', 'og:image:width');
  const ogHeight = getMetaContent(html, 'property', 'og:image:height');

  if (ogUrl && !isAbsoluteHttpsUrl(ogUrl)) problems.push(`${relPath}: og:url is not absolute https (${ogUrl})`);
  if (ogImage && !isAbsoluteHttpsUrl(ogImage)) problems.push(`${relPath}: og:image is not absolute https (${ogImage})`);
  if (twImage && !isAbsoluteHttpsUrl(twImage)) problems.push(`${relPath}: twitter:image is not absolute https (${twImage})`);
  if (ogWidth && ogWidth !== '1200') problems.push(`${relPath}: og:image:width expected 1200, received ${ogWidth}`);
  if (ogHeight && ogHeight !== '630') problems.push(`${relPath}: og:image:height expected 630, received ${ogHeight}`);
}

if (problems.length > 0) {
  console.error('Social meta QA failed:');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Social meta QA passed for ${htmlFiles.length} HTML files.`);
