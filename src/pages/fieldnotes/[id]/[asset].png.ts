// Colocated images are emitted only for entries whose pages are visible.
// This preserves /fieldnotes/<id>/<filename> URLs without putting drafts in public/.
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { isVisible } from '../../../utils/content';

export async function getStaticPaths() {
  const root = resolve('src/content/fieldnotes');
  const entries = await getCollection('fieldnotes', isVisible);
  const paths = [];
  for (const entry of entries) {
    const directory = resolve(root, entry.id + '.assets');
    const within = relative(root, directory);
    if (within === '..' || within.startsWith('..' + sep)) throw new Error('Invalid Fieldnotes asset directory');
    let files;
    try { files = await readdir(directory, { withFileTypes: true }); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue; throw error; }
    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (file.isFile() && extension === 'png') paths.push({
        params: { id: entry.id, asset: file.name.slice(0, -4) },
        props: { filePath: resolve(directory, file.name) },
      });
    }
  }
  return paths;
}
export const GET: APIRoute = async ({ props }) => new Response(
  new Uint8Array(await readFile(props.filePath)),
  { headers: { 'Content-Type': 'image/png' } }
);
