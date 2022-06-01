import { SyntaxKind } from "typescript";

declare global {
    interface DeclareGlobal {
        method(kind: SyntaxKind): void;
    }
}

namespace NotIncluded {}
