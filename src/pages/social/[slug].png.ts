import sharp from 'sharp';
import { articles } from '../../data/news.js';
import { buildSocialCardSvg } from '../../lib/social-card.js';

export const prerender = true;

export function getStaticPaths() {
  return articles.map((article) => ({
    params: { slug: article.slug },
    props: { article }
  }));
}

export async function GET({ props }) {
  const { article } = props;
  const svg = buildSocialCardSvg(article);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
