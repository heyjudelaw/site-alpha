const BASE_URL = 'https://videogennews.com';

export function GET() {
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${BASE_URL}/sitemap.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>${BASE_URL}/news-sitemap.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>\n</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
