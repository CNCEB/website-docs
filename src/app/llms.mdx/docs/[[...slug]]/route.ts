import { docsLlms, source } from '@/lib/source';
import { getPageMarkdownUrl } from '@/lib/shared';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>) {
  const { slug } = await params;
  const page = source.getPage(slug?.slice(0, -1));
  if (!page) notFound();

  // serve the original MDX source of the page, e.g. `/llms.mdx/docs/<slugs>/source.mdx`
  if (slug?.at(-1) === 'source.mdx') {
    try {
      const raw = await readFile(join(process.cwd(), 'content/docs', page.path), 'utf8');
      return new Response(raw, {
        headers: {
          'Content-Type': 'text/markdown',
        },
      });
    } catch {
      // virtual pages (e.g. openapi) have no source file
      notFound();
    }
  }

  return new Response(await docsLlms.page(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageMarkdownUrl(page).segments,
  }));
}
