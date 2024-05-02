// Resolve `pkg` as if we were importing with a `require()`
import type { TypeFromRequire } from "dual" with { "resolution-mode": "require" };

// Resolve `pkg` as if we were importing with an `import`
import type { TypeFromImport } from "dual" with { "resolution-mode": "import" };

export interface MergedType extends TypeFromRequire, TypeFromImport {}
