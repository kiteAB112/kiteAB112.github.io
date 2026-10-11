import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getReadingEntries, entryUrl } from '../utils/content';
import { site } from '../config/site';
export async function GET(context: APIContext) {
  const entries = await getReadingEntries();
  return rss({
    title: site.title, description: site.feedDescription, site: context.site!,
    items: entries.map(entry => {
      const articleUrl = new URL(entryUrl(entry), context.site!);
      if (!entry.rendered?.html) throw new Error(`RSS body unavailable: ${entry.id}`);
      // Use the same rendered Markdown as the site, with portable links for feed readers.
      const content = entry.rendered.html.replace(
        /\b(href|src)="([^"]*)"/g,
        (attribute, name: string, value: string) => {
          if (!value || /^[a-z][a-z\d+.-]*:/i.test(value)) return attribute;
          return `${name}="${new URL(value.replaceAll('&amp;', '&'), articleUrl).href.replaceAll('&', '&amp;')}"`;
        },
      );
      return { title: entry.data.title, description: entry.data.description,
        pubDate: entry.data.published, link: entryUrl(entry), content };
    }),
    customData: '<language>zh-cn</language>',
  });
}
