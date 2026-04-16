import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

const SITE_URL = 'https://deeprootsdrainage.com';

const staticRoutes = [
  '',
  '/about',
  '/services',
  '/projects',
  '/contact',
  '/careers',
  '/careers/apply',
];

export const GET: APIRoute = async () => {
  const [projects, careers] = await Promise.all([
    getCollection('projects', ({ data }) => data.active !== false),
    getCollection('careers', ({ data }) => data.active),
  ]);

  const urls = [
    ...staticRoutes.map((path) => new URL(path, SITE_URL).toString()),
    ...projects.map((project) => new URL(`/projects/${project.slug}`, SITE_URL).toString()),
    ...careers.map((career) => new URL(`/careers/${career.slug}`, SITE_URL).toString()),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
