import { docsLlms } from '@/lib/source';
import { findDocSetNode, getDocSets } from '@/lib/llms';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/docs/[docset]/llms.txt'>,
) {
  const { docset } = await params;
  const node = findDocSetNode(docset);
  if (!node) notFound();

  return new Response(await docsLlms.indexNode(node));
}

export function generateStaticParams() {
  return getDocSets().map(({ slug }) => ({ docset: slug }));
}
