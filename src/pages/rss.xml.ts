import { articles } from '../data/news.js';

const BASE_URL = 'https://videogennews.com';

const escapeXml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export function GET() {
  const latest = articles
    .slice()
    .sort((a, b) => Date.parse(b.updatedAt ?? b.publishedAt ?? b.date) - Date.parse(a.updatedAt ?? a.publishedAt ?? a.date))
    .slice(0, 40);

  const pubDate = latest[0]?.updatedAt ?? latest[0]?.publishedAt ?? new Date().toISOString();
  const items = latest
    .map((article) => {
      const link = `${BASE_URL}/news/${article.slug}/`;
      const date = article.updatedAt ?? article.publishedAt ?? article.date ?? new Date().toISOString();
      return `\n    <item>\n      <title>${escapeXml(article.title)}</title>\n      <link>${link}</link>\n      <guid>${link}</guid>\n      <pubDate>${new Date(date).toUTCString()}</pubDate>\n      <description>${escapeXml(article.description)}</description>\n    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>VideoGenNews</title>\n    <link>${BASE_URL}</link>\n    <description>Source-backed reporting on AI video models, workflows, and policy.</description>\n    <language>en-us</language>\n    <lastBuildDate>${new Date(pubDate).toUTCString()}</lastBuildDate>${items}\n  </channel>\n</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
}
