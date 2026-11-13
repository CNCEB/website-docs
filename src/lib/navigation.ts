import type { Folder, Root } from 'fumadocs-core/page-tree';
import type { LayoutTab } from 'fumadocs-ui/layouts/shared';
import { getLayoutTabs } from 'fumadocs-ui/layouts/shared';

/** 深度优先找子树内第一个页面 URL */
function firstPageUrl(folder: Folder): string | undefined {
  for (const child of folder.children) {
    if (child.type === 'page') return child.url;
    if (child.type === 'folder') {
      const url = firstPageUrl(child);
      if (url) return url;
    }
  }
  return undefined;
}

/**
 * 构建侧边栏 tabs。
 *
 * 区块级 root folder（如 `(notes)`）本身没有入口页——它们只是产品文档组的容器，
 * 所以 getLayoutTabs 会跳过它们。这里手动补上区块 tab：URL 指向首个产品页，
 * 并绑定 `$folder` 以保留下拉选中态与跨产品的结构投影。
 */
export function getDocsetTabs(tree: Root): LayoutTab[] {
  const tabs = getLayoutTabs(tree);

  const manual: LayoutTab[] = [];
  for (const node of tree.children) {
    if (node.type !== 'folder' || !node.root) continue;
    if (tabs.some((tab) => tab.$folder?.$id === node.$id)) continue;

    const url = firstPageUrl(node);
    if (!url) continue;

    manual.push({
      title: node.name,
      icon: node.icon,
      description: node.description,
      url,
      $folder: node,
    });
  }

  return [...tabs, ...manual];
}
