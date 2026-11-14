import type { SyntaxKind } from "typescript/ast" with { "resolution-mode": "import" };

declare global {
    interface DeclareGlobal {
        method(kind: SyntaxKind): void;
    }
}

namespace NotIncluded {}
