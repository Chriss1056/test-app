import { lazy, ComponentType, LazyExoticComponent } from 'react';

export function SectionNotFound({ tab }: { tab: string }) {
  return (<p>Sorry, content for tab &quot;{tab}&quot; was not found.</p>);
}

export function lazyWithFallback<P>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallbackComponent: ComponentType<P>
): LazyExoticComponent<ComponentType<P>> {
  return lazy(() =>
    importFunc().catch(() => ({
      default: fallbackComponent,
    }))
  );
}