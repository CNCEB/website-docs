import { defineConfig } from 'fumadocs-mdx/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (v) => [remarkMdxMermaid, ...v],
    // rehypeKatex 必须在语法高亮插件之前执行
    rehypePlugins: (v) => [rehypeKatex, ...v],
  },
});
