import { Feed } from 'feed';
import { source } from '@/lib/source';
import { getDocSets } from '@/lib/llms';
import { appName, docsRoute } from '@/lib/shared';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/docs/[docset]/rss.xml'>,
) {
  const { docset } = await params;
  if (!getDocSets().some((set) => set.slug === docset)) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const feed = new Feed({
    title: `${appName} · ${docset}`,
    id: `${baseUrl}${docsRoute}`,
    link: `${baseUrl}${docsRoute}`,
    language: 'zh-CN',
    copyright: appName,
  });

  for (const page of source.getPages()) {
    if (page.slugs[0] !== docset || page.type !== 'docs') continue;
    feed.addItem({
      id: page.url,
      title: page.data.title,
      description: page.data.description,
      link: `${baseUrl}${page.url}`,
      date: page.data.lastModified ?? new Date(),
    });
  }

  return new Response(feed.rss2(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}

export function generateStaticParams() {
  return getDocSets().map(({ slug }) => ({ docset: slug }));
}
