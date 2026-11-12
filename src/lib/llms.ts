import type { Folder, Item, Node } from 'fumadocs-core/page-tree';
import { docsRoute } from '@/lib/shared';
import { source } from '@/lib/source';

export interface DocSet {
  /** 文档集 slug，如 `vacuolepao`、`api` */
  slug: string;
  /** 文档集对应的 root folder 节点 */
  node: Folder;
}

function collectRootFolders(nodes: Node[], out: Folder[]) {
  for (const node of nodes) {
    if (node.type !== 'folder') continue;
    if (node.root) out.push(node);
    collectRootFolders(node.children, out);
  }
}

function collectPages(folder: Folder, out: Item[]) {
  for (const child of folder.children) {
    if (child.type === 'page') out.push(child);
    else if (child.type === 'folder') collectPages(child, out);
  }
}

/**
 * 收集所有「文档集」：子树内页面 slug 前缀唯一的 root folder。
 * 区块级路由组（如 `(notes)`）包含多个产品，不构成文档集。
 */
export function getDocSets(): DocSet[] {
  const tree = source.getPageTree();
  const folders: Folder[] = [];
  collectRootFolders(tree.children, folders);
  if (tree.fallback) collectRootFolders(tree.fallback.children, folders);

  const sets = new Map<string, Folder>();
  for (const folder of folders) {
    const pages: Item[] = [];
    collectPages(folder, pages);
    if (pages.length === 0) continue;

    const slugs = new Set(
      pages.map((page) => page.url.slice(docsRoute.length + 1).split('/')[0]),
    );
    const [slug] = slugs;
    if (slugs.size === 1 && slug && !sets.has(slug)) sets.set(slug, folder);
  }

  return [...sets.entries()].map(([slug, node]) => ({ slug, node }));
}

export function findDocSetNode(slug: string): Folder | undefined {
  return getDocSets().find((set) => set.slug === slug)?.node;
}
