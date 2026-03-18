import type { JsonLdObject } from "./types";

/**
 * Given a raw JSON-LD object (potentially containing @graph),
 * return a flat array of individual schema objects each with an @type.
 */
export function flattenJsonLd(obj: JsonLdObject): JsonLdObject[] {
  // Handle @graph: { "@graph": [...] }
  const graph = obj["@graph"];
  if (Array.isArray(graph)) {
    const results: JsonLdObject[] = [];
    for (const item of graph) {
      if (isObject(item)) {
        // Inherit @context from parent if not set on child
        if (!item["@context"] && obj["@context"]) {
          results.push({ "@context": obj["@context"], ...item });
        } else {
          results.push(item);
        }
      }
    }
    return results;
  }

  return [obj];
}

/**
 * Flatten an array of raw JSON-LD blocks into individual typed schemas.
 * Filters out objects with no @type.
 */
export function parseSchemas(rawBlocks: JsonLdObject[]): JsonLdObject[] {
  const flattened: JsonLdObject[] = [];

  for (const block of rawBlocks) {
    const schemas = flattenJsonLd(block);
    for (const schema of schemas) {
      if (schema["@type"]) {
        flattened.push(schema);
      }
    }
  }

  return flattened;
}

/**
 * Normalize @type to a plain string.
 * Handles arrays (take first), short-form values, and full URLs.
 */
export function resolveType(typeValue: unknown): string {
  let raw: string;

  if (Array.isArray(typeValue)) {
    raw = String(typeValue[0] ?? "");
  } else {
    raw = String(typeValue ?? "");
  }

  // Strip schema.org namespace prefix if present
  // e.g. "https://schema.org/Article" → "Article"
  const match = /(?:https?:\/\/schema\.org\/)(.+)/.exec(raw);
  return match ? match[1] : raw;
}

function isObject(value: unknown): value is JsonLdObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
