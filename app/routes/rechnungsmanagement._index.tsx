import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useState, Suspense, useMemo } from 'react';
import { lazyWithFallback, SectionNotFound } from '../components/common/404';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const tabs = ['Tab1', 'Tab2', 'Tab3', 'Tab4', 'Tab5'];

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeTab = tabs[activeTabIndex];

  const ActiveComponent = useMemo(() => {
    const Fallback = () => <SectionNotFound tab={activeTab} />;

    return lazyWithFallback(
      () => import(`../components/rechnungsmanagement/section-${activeTabIndex}.tsx`),
      Fallback
    );
  }, [activeTab, activeTabIndex]);

  return (
    <s-page heading="Rechnungsmanagement">
      <s-banner heading="Development Notice" tone="warning">
        This App is still under Development.
      </s-banner>
      <s-stack gap="base">
        <s-stack direction="inline" gap="base">
          {tabs.map((tab, index) => (
            <s-button
              key={tab}
              variant={tab === activeTab ? 'secondary' : 'tertiary'}
              onClick={() => setActiveTabIndex(index)}
            >
              {tab}
            </s-button>
          ))}
        </s-stack>
        <s-section heading={activeTab}>
          <Suspense fallback={<p>Loading {activeTab}...</p>}>
            <ActiveComponent />
          </Suspense>
        </s-section>
      </s-stack>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};