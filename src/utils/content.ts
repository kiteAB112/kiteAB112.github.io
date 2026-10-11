import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
export type Entry = CollectionEntry<CollectionKey>;
export const labels: Record<CollectionKey, string> = {
  articles: '文章', projects: '项目', fieldnotes: 'Fieldnotes',
};
export const isVisible = (entry: Entry) =>
  !entry.data.draft || (import.meta.env.DEV && entry.collection === 'fieldnotes');
export const byDate = (a: Entry, b: Entry) =>
  b.data.published.valueOf() - a.data.published.valueOf() || a.id.localeCompare(b.id);
export const entryUrl = (entry: Pick<Entry, 'collection' | 'id'>) =>
  '/' + entry.collection + '/' + entry.id + '/';
export const tagUrl = (tag: string) => '/tags/' + encodeURIComponent(tag) + '/';
export const dateLabel = (date: Date) => date.toLocaleDateString('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai',
});
export const entryLabel = (entry: Entry) => entry.collection === 'articles'
  ? { article: '文章', experiment: '实验', note: '笔记' }[entry.data.kind]
  : labels[entry.collection];
export function adjacentEntries(entries: Entry[], current: Entry) {
  const published = entries.filter(entry => !entry.data.draft).sort(byDate);
  const index = published.findIndex(entry => entry.id === current.id);
  const toLink = (entry?: Entry) => entry ? { title: entry.data.title, url: entryUrl(entry) } : undefined;
  return {
    older: index >= 0 ? toLink(published[index + 1]) : undefined,
    newer: index > 0 ? toLink(published[index - 1]) : undefined,
  };
}
export const sourceUrl = (filePath?: string) =>
  filePath?.replaceAll('\\', '/').replace(/^.*?src\/content\//, 'src/content/');
export async function getReadingEntries() {
  return (await getCollection('articles', entry => !entry.data.draft)).sort(byDate);
}
export async function getPublicEntries() {
  return (await Promise.all([
    getCollection('articles'), getCollection('projects'), getCollection('fieldnotes'),
  ])).flat().filter(entry => !entry.data.draft).sort(byDate);
}
