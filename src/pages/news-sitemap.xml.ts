import { articles } from '../data/news.js';

const BASE_URL = 'https://videogennews.com';
const PUBLICATION_NAME = 'VideoGenNews';
const PUBLICATION_LANGUAGE = 'en';
const NEWS_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

const escapeXml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export function GET() {
  const cutoff = Date.now() - NEWS_WINDOW_MS;
  const recentStories = articles
    .filter((article) => Date.parse(article.publishedAt ?? article.date) >= cutoff)
    .sort((a, b) => Date.parse(b.publishedAt ?? b.date) - Date.parse(a.publishedAt ?? a.date))
    .slice(0, 1000);

  const entries = recentStories
    .map((article) => {
      const url = `${BASE_URL}/news/${article.slug}/`;
      const publishedAt = new Date(article.publishedAt ?? article.date).toISOString();
      return `\n  <url>\n    <loc>${url}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>${escapeXml(PUBLICATION_NAME)}</news:name>\n        <news:language>${PUBLICATION_LANGUAGE}</news:language>\n      </news:publication>\n      <news:publication_date>${publishedAt}</news:publication_date>\n      <news:title>${escapeXml(article.title)}</news:title>\n    </news:news>\n  </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${entries}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
