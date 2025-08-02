"use client";

import { useEffect, useState } from "react";
import { RedocStandalone } from "redoc";

// Define the type for the OpenAPI spec
interface ServerObject {
  url: string;
  description?: string;
  [key: string]: unknown;
}

interface OpenAPISpec {
  openapi?: string;
  info?: {
    title?: string;
    version?: string;
    [key: string]: unknown;
  };
  servers?: ServerObject[];
  paths: Record<string, unknown>;
  components?: Record<string, unknown>;
  tags?: Array<{ name: string; description?: string }>;
  [key: string]: unknown;
}

export default function DocsClient() {
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);

  useEffect(() => {
    // Verify the OpenAPI JSON file is accessible
    fetch("/filtered-openapi.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load OpenAPI spec: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((spec: OpenAPISpec) => {
        // Update the server URL in the OpenAPI spec
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "localhost:8000";

        // Create a new spec with updated server URL
        const updatedSpec = {
          ...spec,
          servers: [
            {
              url: backendUrl,
              description: "Production server",
            },
          ],
        };

        setSpec(updatedSpec);
      })
      .catch((err) => {
        console.error("Error loading OpenAPI spec:", err);
        setError("Failed to load API documentation. Please try again later.");
      });
  }, []);

  if (error) {
    // Error state UI remains the same
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Documentation
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      <RedocStandalone
        spec={spec} // Use the modified spec instead of specUrl
        options={{
          scrollYOffset: 60, // Adjust for fixed headers if needed
          hideDownloadButton: false,
          expandSingleSchemaField: true,
          menuToggle: true,
          theme: {
            colors: {
              primary: {
                main: "#1890ff",
              },
            },
          },
        }}
      />
    </div>
  );
}
