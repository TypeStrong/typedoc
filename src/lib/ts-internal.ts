import * as ts from "typescript";

/**
 * Expose the internal TypeScript APIs that are used by TypeDoc
 */
declare module "typescript" {
    interface Symbol {
        // https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/types.ts#L2660
        parent?: ts.Symbol;
    }

    interface Node {
        // https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/types.ts#L497
        symbol?: ts.Symbol;
        // https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/types.ts#L500
        localSymbol?: ts.Symbol;
    }
}
