const SITE_TAGLINE = 'Source-linked reporting on AI video models, workflows, and policy.';

export const SOCIAL_CARD_WIDTH = 1200;
export const SOCIAL_CARD_HEIGHT = 630;

const DEFAULT_PALETTE = {
  accent: '#f28f16',
  accentSoft: '#fff0d9',
  accentMuted: '#f4d9b3',
  panel: '#161616',
  panelSoft: '#242424',
  paper: '#f5f1e8',
  line: '#d6cec0',
  signal: '#0e9cc0'
};

const DESK_PALETTES = {
  'Policy/IP Watch': {
    accent: '#d05d00',
    accentSoft: '#ffe3cb',
    accentMuted: '#f7c999',
    panel: '#23150d',
    panelSoft: '#3a2416',
    paper: '#f7f1e7',
    line: '#dbcbb8',
    signal: '#7d9ecf'
  },
  'Model Wire': {
    accent: '#2457d6',
    accentSoft: '#dce8ff',
    accentMuted: '#b7cbff',
    panel: '#111c38',
    panelSoft: '#1d305a',
    paper: '#f2f5fb',
    line: '#cbd5e4',
    signal: '#5bc0eb'
  },
  'Toolchain Desk': {
    accent: '#0f8a6c',
    accentSoft: '#d8f4ea',
    accentMuted: '#a6decb',
    panel: '#112721',
    panelSoft: '#193d32',
    paper: '#eef6f3',
    line: '#c8d8d2',
    signal: '#50c3a5'
  },
  'Distribution Intelligence': {
    accent: '#9e2c59',
    accentSoft: '#ffe1eb',
    accentMuted: '#efb9ce',
    panel: '#2b1020',
    panelSoft: '#451935',
    paper: '#faf1f4',
    line: '#e0c8d1',
    signal: '#ff8bb6'
  },
  'Verification Desk': {
    accent: '#8748ff',
    accentSoft: '#eee3ff',
    accentMuted: '#d2beff',
    panel: '#1f1438',
    panelSoft: '#30215a',
    paper: '#f5f2fb',
    line: '#d3cae6',
    signal: '#9ac7ff'
  },
  'Workflow Lab': {
    accent: '#0d9c8d',
    accentSoft: '#dff7f4',
    accentMuted: '#b2e7df',
    panel: '#0e2724',
    panelSoft: '#163c38',
    paper: '#edf7f5',
    line: '#c8dad6',
    signal: '#45c5b6'
  },
  'Research-to-Product': {
    accent: '#a05614',
    accentSoft: '#f9e8d6',
    accentMuted: '#ebc7a2',
    panel: '#2c1a10',
    panelSoft: '#472919',
    paper: '#f7f1ea',
    line: '#dbcdbd',
    signal: '#e0aa3e'
  }
};

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const truncateLine = (value, maxChars) => {
  if (value.length <= maxChars) return value;
  const shortened = value.slice(0, Math.max(0, maxChars - 3));
  return `${shortened.replace(/[ .,:;/-]+$/g, '')}...`;
};

const wrapText = (text, { maxChars, maxLines }) => {
  const normalized = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const words = normalized.split(' ');
  const lines = [];
  let current = '';
  let index = 0;

  while (index < words.length) {
    const word = words[index];
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxChars || !current) {
      current = candidate;
      index += 1;
      continue;
    }

    lines.push(current);
    current = '';

    if (lines.length === maxLines) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  if (index < words.length) {
    const lastLine = lines[lines.length - 1] ?? '';
    lines[lines.length - 1] = truncateLine(lastLine, maxChars);
    if (!lines[lines.length - 1].endsWith('...')) {
      lines[lines.length - 1] = truncateLine(`${lines[lines.length - 1]}...`, maxChars);
    }
  }

  return lines.slice(0, maxLines);
};

const formatDisplayDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(value));

const formatTopic = (value) => value.replace(/-/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());

const renderLines = ({ lines, x, y, lineHeight, fill, fontSize, fontWeight, letterSpacing = 0, fontFamily }) =>
  lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" letter-spacing="${letterSpacing}">${escapeXml(line)}</text>`
    )
    .join('');

const renderScoreDots = ({ x, y, score, accent, muted }) =>
  Array.from({ length: 5 }, (_, index) => {
    const cx = x + index * 26;
    const fill = index < score ? accent : muted;
    return `<circle cx="${cx}" cy="${y}" r="8" fill="${fill}" />`;
  }).join('');

export const getSocialCardPath = (slug) => `/social/${slug}.png`;

export const getAbsoluteSocialCardUrl = (siteUrl, slug) => new URL(getSocialCardPath(slug), siteUrl).toString();

export const buildSocialCardSvg = (article) => {
  const palette = DESK_PALETTES[article.desk] ?? DEFAULT_PALETTE;
  const publishedLabel = formatDisplayDate(article.publishedAt ?? article.date);
  const updatedLabel = formatDisplayDate(article.updatedAt ?? article.publishedAt ?? article.date);
  const headlineConfig =
    article.title.length > 118
      ? { size: 40, maxChars: 22, maxLines: 5 }
      : article.title.length > 100
        ? { size: 44, maxChars: 23, maxLines: 5 }
        : article.title.length > 84
          ? { size: 50, maxChars: 24, maxLines: 4 }
          : { size: 60, maxChars: 26, maxLines: 4 };
  const headlineSize = headlineConfig.size;
  const headlineLines = wrapText(article.title, {
    maxChars: headlineConfig.maxChars,
    maxLines: headlineConfig.maxLines
  });
  const headlineLineHeight = Math.round(headlineSize * 1.08);
  const headlineY = 236;
  const headlineHeight = headlineLines.length * headlineLineHeight;
  const descriptionMaxLines = headlineLines.length >= 5 ? 0 : headlineLines.length >= 4 ? 1 : 2;
  const descriptionLines = descriptionMaxLines
    ? wrapText(article.description, {
        maxChars: 58,
        maxLines: descriptionMaxLines
      })
    : [];
  const descriptionY = headlineY + headlineHeight + 28;
  const topics = (article.tags ?? []).slice(0, 3).map(formatTopic);
  const deskLabel = `${article.desk} / ${article.contentType}`.toUpperCase();
  const sourceCount = article.sources?.length ?? article.sourceRefs?.length ?? 0;
  const authorName = article.author ?? 'VideoGenNews Desk';

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${SOCIAL_CARD_WIDTH}" height="${SOCIAL_CARD_HEIGHT}" viewBox="0 0 ${SOCIAL_CARD_WIDTH} ${SOCIAL_CARD_HEIGHT}" role="img" aria-label="${escapeXml(article.title)} social preview card">
  <defs>
    <linearGradient id="accent-wash" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.14" />
      <stop offset="100%" stop-color="${palette.signal}" stop-opacity="0.04" />
    </linearGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="${palette.line}" stroke-width="1" />
    </pattern>
    <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="#000000" flood-opacity="0.12" />
    </filter>
    <clipPath id="copy-clip">
      <rect x="74" y="150" width="740" height="308" rx="12" />
    </clipPath>
  </defs>

  <rect width="${SOCIAL_CARD_WIDTH}" height="${SOCIAL_CARD_HEIGHT}" fill="${palette.paper}" />
  <rect width="${SOCIAL_CARD_WIDTH}" height="${SOCIAL_CARD_HEIGHT}" fill="url(#grid)" opacity="0.28" />
  <circle cx="1055" cy="88" r="180" fill="${palette.accent}" opacity="0.1" />
  <circle cx="1084" cy="570" r="210" fill="${palette.signal}" opacity="0.08" />
  <rect x="40" y="36" width="1120" height="558" rx="28" fill="#fffdf9" stroke="#141414" stroke-width="2" filter="url(#card-shadow)" />
  <rect x="40" y="36" width="1120" height="18" rx="28" fill="${palette.accent}" />
  <rect x="40" y="54" width="1120" height="540" rx="0 0 28 28" fill="url(#accent-wash)" />

  <text x="78" y="108" fill="#161616" font-family="DejaVu Sans, Arial, sans-serif" font-size="23" font-weight="800" letter-spacing="4">VIDEOGENNEWS</text>
  <text x="78" y="136" fill="#5a5852" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="600">${escapeXml(SITE_TAGLINE)}</text>

  <rect x="78" y="164" width="366" height="38" rx="19" fill="${palette.accentSoft}" stroke="${palette.accent}" stroke-width="1.5" />
  <text x="98" y="189" fill="#171717" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="1.2">${escapeXml(deskLabel)}</text>

  <g clip-path="url(#copy-clip)">
    ${renderLines({
      lines: headlineLines,
      x: 78,
      y: headlineY,
      lineHeight: headlineLineHeight,
      fill: '#141414',
      fontSize: headlineSize,
      fontWeight: 800,
      fontFamily: 'DejaVu Sans, Arial, sans-serif'
    })}

    ${renderLines({
      lines: descriptionLines,
      x: 82,
      y: descriptionY,
      lineHeight: 34,
      fill: '#3b3a37',
      fontSize: 28,
      fontWeight: 500,
      fontFamily: 'DejaVu Sans, Arial, sans-serif'
    })}
  </g>

  <g transform="translate(78 486)">
    <rect width="214" height="72" rx="18" fill="#ffffff" stroke="${palette.line}" stroke-width="1.5" />
    <text x="20" y="28" fill="#6c645c" font-family="DejaVu Sans, Arial, sans-serif" font-size="15" font-weight="800" letter-spacing="1.3">PUBLISHED</text>
    <text x="20" y="55" fill="#141414" font-family="DejaVu Sans, Arial, sans-serif" font-size="24" font-weight="800">${escapeXml(publishedLabel)}</text>
  </g>

  <g transform="translate(308 486)">
    <rect width="246" height="72" rx="18" fill="#ffffff" stroke="${palette.line}" stroke-width="1.5" />
    <text x="20" y="28" fill="#6c645c" font-family="DejaVu Sans, Arial, sans-serif" font-size="15" font-weight="800" letter-spacing="1.3">BYLINE</text>
    <text x="20" y="55" fill="#141414" font-family="DejaVu Sans, Arial, sans-serif" font-size="24" font-weight="800">${escapeXml(truncateLine(authorName, 17))}</text>
  </g>

  <g transform="translate(570 486)">
    <rect width="236" height="72" rx="18" fill="#ffffff" stroke="${palette.line}" stroke-width="1.5" />
    <text x="20" y="28" fill="#6c645c" font-family="DejaVu Sans, Arial, sans-serif" font-size="15" font-weight="800" letter-spacing="1.3">SOURCE COUNT</text>
    <text x="20" y="55" fill="#141414" font-family="DejaVu Sans, Arial, sans-serif" font-size="24" font-weight="800">${sourceCount} linked source${sourceCount === 1 ? '' : 's'}</text>
  </g>

  <g transform="translate(846 72)">
    <rect width="274" height="486" rx="24" fill="${palette.panel}" />
    <rect width="274" height="12" rx="24" fill="${palette.accent}" />
    <text x="30" y="58" fill="#f4f1ea" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="2">SOCIAL BRIEF</text>
    <text x="30" y="100" fill="#ffffff" font-family="DejaVu Sans, Arial, sans-serif" font-size="34" font-weight="900">${escapeXml(article.contentType.toUpperCase())}</text>

    <rect x="24" y="128" width="106" height="94" rx="18" fill="${palette.panelSoft}" stroke="rgba(255,255,255,0.1)" />
    <text x="42" y="160" fill="#bcb6aa" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="800" letter-spacing="1.2">EVIDENCE</text>
    <text x="40" y="202" fill="#ffffff" font-family="DejaVu Sans, Arial, sans-serif" font-size="42" font-weight="900">${article.evidenceScore}/5</text>

    <rect x="144" y="128" width="106" height="94" rx="18" fill="${palette.panelSoft}" stroke="rgba(255,255,255,0.1)" />
    <text x="173" y="160" fill="#bcb6aa" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="800" letter-spacing="1.2">RISK</text>
    <text x="172" y="202" fill="#ffffff" font-family="DejaVu Sans, Arial, sans-serif" font-size="42" font-weight="900">${article.riskScore}/5</text>

    <text x="30" y="264" fill="#bcb6aa" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="800" letter-spacing="1.2">SIGNAL</text>
    ${renderScoreDots({ x: 38, y: 286, score: article.evidenceScore, accent: palette.accent, muted: '#514b43' })}
    ${renderScoreDots({ x: 38, y: 320, score: article.riskScore, accent: palette.signal, muted: '#514b43' })}

    <text x="30" y="372" fill="#bcb6aa" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="800" letter-spacing="1.2">TOPICS</text>
    ${renderLines({
      lines: topics.length > 0 ? topics : ['AI Video'],
      x: 30,
      y: 406,
      lineHeight: 32,
      fill: '#ffffff',
      fontSize: 24,
      fontWeight: 700,
      fontFamily: 'DejaVu Sans, Arial, sans-serif'
    })}

    <text x="30" y="504" fill="#d7d2c8" font-family="DejaVu Sans, Arial, sans-serif" font-size="17" font-weight="700">Updated ${escapeXml(updatedLabel)}</text>
    <text x="30" y="534" fill="#d7d2c8" font-family="DejaVu Sans, Arial, sans-serif" font-size="17" font-weight="700">videogennews.com</text>
  </g>
</svg>`;
};
