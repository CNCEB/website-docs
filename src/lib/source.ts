import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { openapi } from './openapi';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader(
  {
    docs: docs.toFumadocsSource(),
    api: await openapi.staticSource({ baseDir: 'api' }),
  },
  {
    baseUrl: docsRoute,
    plugins: [lucideIconsPlugin(), openapi.loaderPlugin()],
  },
);

export const docsLlms = llms(source, {
  renderPage: async (page) => {
    // openapi 虚拟页（source key 为 `api`）
    if (page.type === 'api') {
      const text = page.data.structuredData.contents
        .map((item) => item.content)
        .join('\n\n');
      return `# ${page.data.title} (${page.url})\n\n${text}`.trim();
    }

    return `# ${page.data.title} (${page.url})\n\n${await page.data.getText('processed')}`;
  },
});
