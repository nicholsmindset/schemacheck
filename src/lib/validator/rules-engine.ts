/**
 * rules-engine.ts — compatibility re-export shim
 *
 * The validation logic now lives in schema-rules.ts which supports
 * type-aware validation and `also_matches` aliasing.
 * All existing importers of rules-engine continue to work unchanged.
 */
export { validateSchema, RULE_MAP } from "./schema-rules";
