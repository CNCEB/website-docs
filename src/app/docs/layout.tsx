import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/spacious';
import { baseOptions } from '@/lib/layout.shared';
import { getDocsetTabs } from '@/lib/navigation';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  const tree = source.getPageTree();

  return (
    <DocsLayout tree={tree} tabs={getDocsetTabs(tree)} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
