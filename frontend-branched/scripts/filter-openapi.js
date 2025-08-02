import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fullSchema = JSON.parse(
  await readFile(join(__dirname, "./full-openapi.json"), "utf-8")
);

// A) By path‐prefix whitelist:
// const allowedPrefixes = ["/api/v1/public", "/api/v1/auth"];

// B) By specific tags:
const allowedTags = new Set(["context-tree"]);

const filteredPaths = {};
for (const [path, pathItem] of Object.entries(fullSchema.paths)) {
  // A) Path‐prefix filter:
  //   if (allowedPrefixes.some((pref) => path.startsWith(pref))) {
  //     filteredPaths[path] = pathItem;
  //   }

  // B) Tag‐based filter (uncomment if you prefer):

  const operations = Object.values(pathItem);
  const hasAllowedTag = operations.some((op) => {
    return (
      Array.isArray(op.tags) && op.tags.some((tag) => allowedTags.has(tag))
    );
  });
  if (hasAllowedTag) {
    filteredPaths[path] = pathItem;
  }
}

const filteredSchema = {
  ...fullSchema,
  paths: filteredPaths,
};

await writeFile(
  join(__dirname, "../public/filtered-openapi.json"),
  JSON.stringify(filteredSchema, null, 2),
  "utf-8"
);
console.log("Filtered OpenAPI schema written to /public/filtered-openapi.json");
