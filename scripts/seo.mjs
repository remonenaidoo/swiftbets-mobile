// Writes robots.txt and sitemap.xml for the brand's public URL into the web export.
import { writeFileSync } from 'node:fs';

const [dist = 'dist'] = process.argv.slice(2);
const site = (process.env.EXPO_PUBLIC_SITE_URL ?? 'https://swiftbets.swiftsoftwaresystems.co.za').replace(/\/$/, '');
const pages = ['/', '/sports/soccer', '/casino', '/promotions'];

writeFileSync(`${dist}/robots.txt`, `User-agent: *\nAllow: /\nDisallow: /account/\nDisallow: /casino/play\nDisallow: /my-bets\nSitemap: ${site}/sitemap.xml\n`);
writeFileSync(
  `${dist}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .map((p) => `  <url><loc>${site}${p}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);
console.log(`seo: robots.txt and sitemap.xml for ${site}`);
