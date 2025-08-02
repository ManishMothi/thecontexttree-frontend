import type { Metadata } from 'next';
import DocsClient from "./DocsClient";

export const metadata: Metadata = {
  title: 'API Reference',
  description: 'API Documentation',
};

export default function DocsPage() {
  return (
    <>
      <head>
        {/* Load Redoc's standalone CSS from CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.css"
        />
      </head>
      <DocsClient />
    </>
  );
}
