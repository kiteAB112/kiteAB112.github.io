import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublicEntries, entryUrl } from '../utils/content';
import { site } from '../config/site';
export async function GET(context: APIContext) {
  const entries = await getPublicEntries();
  return rss({
    title: site.title, description: site.description, site: context.site!,
    items: entries.map(entry => ({ title: entry.data.title, description: entry.data.description, pubDate: entry.data.published, link: entryUrl(entry) })),
    customData: '<language>zh-cn</language>',
  });
}
