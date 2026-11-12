import { docsLlms, source } from '@/lib/source';
import { getDocSets } from '@/lib/llms';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/docs/[docset]/llms-full.txt'>,
) {
  const { docset } = await params;
  if (!getDocSets().some((set) => set.slug === docset)) notFound();

  const pages = source
    .getPages()
    .filter((page) => page.slugs[0] === docset)
    .sort((a, b) => a.path.localeCompare(b.path));
  const out = await Promise.all(pages.map((page) => docsLlms.page(page)));

  return new Response(out.filter(Boolean).join('\n\n'));
}

export function generateStaticParams() {
  return getDocSets().map(({ slug }) => ({ docset: slug }));
}
