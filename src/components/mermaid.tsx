'use client';

import { useId } from 'react';
import mermaid from 'mermaid';
import { useSyncExternalStore } from 'react';

let currentTheme: 'default' | 'dark' = 'default';

const listeners = new Set<() => void>();

function setTheme(theme: 'default' | 'dark') {
  if (currentTheme === theme) return;
  currentTheme = theme;
  listeners.forEach((listener) => listener());
}

// observe <html> class changes to switch mermaid theme (dark mode)
if (typeof window !== 'undefined') {
  const observer = new MutationObserver(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'default');
  });
  observer.observe(document.documentElement, { attributeFilter: ['class'] });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getTheme() {
  return currentTheme;
}

let initialized = false;

function init() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'default',
  });
  initialized = true;
}

export function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'default' as const);

  const svg = useSyncExternalStore(
    subscribe,
    () => {
      // re-render on theme change: track rendered charts in an external cache
      const cacheKey = `${id}:${theme}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;
      init();
      mermaid
        .render(`mermaid-${id}-${theme}`, chart)
        .then(({ svg }) => {
          cache.set(cacheKey, svg);
          listeners.forEach((listener) => listener());
        })
        .catch(() => {
          cache.set(cacheKey, '');
          listeners.forEach((listener) => listener());
        });
      return undefined;
    },
    () => undefined,
  );

  if (svg === undefined) {
    return <pre className="text-fd-muted-foreground">Mermaid 渲染中...</pre>;
  }
  if (svg === '') {
    return (
      <pre className="rounded-lg border bg-fd-secondary/50 p-4 text-sm text-fd-muted-foreground whitespace-pre-wrap">
        {chart}
      </pre>
    );
  }
  return (
    <div
      className="[&_svg]:mx-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const cache = new Map<string, string>();
