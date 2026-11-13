import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { createFromSource } from 'fumadocs-core/search/server';
import { source, docsLlms } from '@/lib/source';
import { findDocSetNode, getDocSets } from '@/lib/llms';
import { notFound } from 'next/navigation';
import { z } from 'zod';

export const revalidate = false;

/**
 * 每个文档集一个独立 MCP 地址：/api/mcp/<docset>
 * 工具（list_pages/get_page/search）只作用于该文档集的页面。
 */
function createHandler(docset: string) {
  return createMcpHandler(() => {
    const server = new McpServer(
      { name: `zhongyun-yibing-docs:${docset}`, version: '1.0.0' },
      // 工具固定不变，避免 streamable 连接长期持有
      { capabilities: { tools: { listChanged: false } } },
    );

    const node = findDocSetNode(docset);
    const searchServer = createFromSource(source);

    server.registerTool(
      'list_pages',
      {
        title: 'List Pages',
        description: `List all pages of the "${docset}" doc set`,
        inputSchema: z.object({}),
      },
      async () => ({
        content: [{ type: 'text', text: node ? await docsLlms.indexNode(node) : '' }],
      }),
    );

    server.registerTool(
      'get_page',
      {
        title: 'Get Page',
        description: `Get one page as Markdown by URL, e.g. /docs/${docset}/xxx`,
        inputSchema: z.object({ url: z.string() }),
      },
      async ({ url }) => {
        const slugs = url
          .replace(/^\/docs\//, '')
          .split('/')
          .filter(Boolean);
        const page = source.getPage(slugs);
        if (!page || page.slugs[0] !== docset) {
          return {
            content: [{ type: 'text', text: `page not found: ${url}` }],
            isError: true,
          };
        }
        return { content: [{ type: 'text', text: await docsLlms.page(page) }] };
      },
    );

    server.registerTool(
      'search',
      {
        title: 'Search Docs',
        description: `Search pages of the "${docset}" doc set with a query`,
        inputSchema: z.object({ query: z.string() }),
      },
      async ({ query }) => {
        const results = await searchServer.search(query);
        const filtered = results.filter(
          (r) => r.url === `/docs/${docset}` || r.url.startsWith(`/docs/${docset}/`),
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(filtered) }],
        };
      },
    );

    return server;
  });
}

function isValidDocset(docset: string) {
  return getDocSets().some((set) => set.slug === docset);
}

export async function GET(
  req: Request,
  { params }: RouteContext<'/api/mcp/[docset]'>,
) {
  const { docset } = await params;
  if (!isValidDocset(docset)) notFound();
  return createHandler(docset).fetch(req);
}

export async function POST(
  req: Request,
  { params }: RouteContext<'/api/mcp/[docset]'>,
) {
  const { docset } = await params;
  if (!isValidDocset(docset)) notFound();
  return createHandler(docset).fetch(req);
}

export async function DELETE(
  req: Request,
  { params }: RouteContext<'/api/mcp/[docset]'>,
) {
  const { docset } = await params;
  if (!isValidDocset(docset)) notFound();
  return createHandler(docset).fetch(req);
}
