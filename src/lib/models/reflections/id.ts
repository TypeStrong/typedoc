import type ts from "typescript";
import { getQualifiedName } from "../../utils/tsutils";

/**
 * See {@link ReflectionSymbolId}
 */
export type ReflectionSymbolIdString = string & {
    readonly __reflectionSymbolId: unique symbol;
};

/**
 * This exists so that TypeDoc can store a unique identifier for a `ts.Symbol` without
 * keeping a reference to the `ts.Symbol` itself. This identifier should be stable across
 * runs so long as the symbol is exported from the same file.
 */
export class ReflectionSymbolId {
    readonly fileName: string;
    readonly qualifiedName: string;
    /**
     * Note: This is **not** serialized. It exists for sorting by declaration order, but
     * should not be needed when deserializing form JSON.
     */
    pos: number;

    constructor(symbol: ts.Symbol, declaration = symbol.declarations?.[0]) {
        this.fileName = declaration?.getSourceFile().fileName ?? "\0";
        this.qualifiedName = getQualifiedName(symbol, symbol.name);
        this.pos = declaration?.pos ?? Infinity;
    }

    toIdString(): ReflectionSymbolIdString {
        if (Number.isFinite(this.pos)) {
            return `${this.fileName}\0${this.qualifiedName}\0${this.pos}` as ReflectionSymbolIdString;
        } else {
            return `${this.fileName}\0${this.qualifiedName}` as ReflectionSymbolIdString;
        }
    }

    toObject() {
        return {
            sourceFileName: this.fileName,
            qualifiedName: this.qualifiedName,
        };
    }
}
