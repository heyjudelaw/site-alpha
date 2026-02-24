import { articles, authors, desks } from '../data/news.js';

const BASE_URL = 'https://videogennews.com';

const deskSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function GET() {
  const staticUrls = [
    '/',
    '/news/',
    '/about/',
    '/masthead/',
    '/contact/',
    '/newsletter/',
    '/rss.xml',
    '/authors/',
    '/editorial-policy/',
    '/methodology/',
    '/corrections/',
    '/advertising-disclosure/',
    '/privacy/',
    '/terms/'
  ];
  const deskUrls = desks.map((desk) => `/desks/${deskSlug(desk)}/`);
  const authorUrls = authors.map((author) => `/authors/${author.slug}/`);
  const storyUrls = articles.map((article) => `/news/${article.slug}/`);

  const entries = [...staticUrls, ...deskUrls, ...authorUrls, ...storyUrls]
    .map((path) => {
      const article = articles.find((item) => `/news/${item.slug}/` === path);
      const lastmod = article?.updatedAt ?? article?.publishedAt;
      return `\n  <url>\n    <loc>${BASE_URL}${path}</loc>${lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}\n  </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
