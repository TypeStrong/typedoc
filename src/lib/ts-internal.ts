import * as ts from "typescript";

/**
 * Expose the internal TypeScript APIs that are used by TypeDoc
 */
declare module "typescript" {
    interface Node {
        // https://github.com/microsoft/TypeScript/blob/v4.1.5/src/compiler/types.ts#L847
        symbol?: ts.Symbol;
    }

    interface Symbol {
        // https://github.com/microsoft/TypeScript/blob/v4.1.5/src/compiler/types.ts#L4734-L4737
        checkFlags?: CheckFlags;
    }

    interface TypeChecker {
        // https://github.com/microsoft/TypeScript/blob/v4.1.5/src/compiler/types.ts#L4145
        // https://github.com/microsoft/TypeScript/issues/42118
        getTypePredicateOfSignature(
            signature: ts.Signature
        ): ts.TypePredicate | undefined;
    }

    // https://github.com/microsoft/TypeScript/blob/e213b2af3430bdc9cf5fbc76a8634d832e7aaaaa/src/compiler/types.ts#L5298-L5299
    export interface UnionType {
        /* @internal */
        origin?: ts.Type; // Denormalized union, intersection, or index type in which union originates
    }

    // https://github.com/microsoft/TypeScript/blob/v4.1.5/src/compiler/types.ts#L4707-L4732
    /* @internal */
    export enum CheckFlags {
        Instantiated = 1 << 0, // Instantiated symbol
        SyntheticProperty = 1 << 1, // Property in union or intersection type
        SyntheticMethod = 1 << 2, // Method in union or intersection type
        Readonly = 1 << 3, // Readonly transient symbol
        ReadPartial = 1 << 4, // Synthetic property present in some but not all constituents
        WritePartial = 1 << 5, // Synthetic property present in some but only satisfied by an index signature in others
        HasNonUniformType = 1 << 6, // Synthetic property with non-uniform type in constituents
        HasLiteralType = 1 << 7, // Synthetic property with at least one literal type in constituents
        ContainsPublic = 1 << 8, // Synthetic property with public constituent(s)
        ContainsProtected = 1 << 9, // Synthetic property with protected constituent(s)
        ContainsPrivate = 1 << 10, // Synthetic property with private constituent(s)
        ContainsStatic = 1 << 11, // Synthetic property with static constituent(s)
        Late = 1 << 12, // Late-bound symbol for a computed property with a dynamic name
        ReverseMapped = 1 << 13, // Property of reverse-inferred homomorphic mapped type
        OptionalParameter = 1 << 14, // Optional parameter
        RestParameter = 1 << 15, // Rest parameter
        DeferredType = 1 << 16, // Calculation of the type of this symbol is deferred due to processing costs, should be fetched with `getTypeOfSymbolWithDeferredType`
        HasNeverType = 1 << 17, // Synthetic property with at least one never type in constituents
        Mapped = 1 << 18, // Property of mapped type
        StripOptional = 1 << 19, // Strip optionality in mapped property
        Synthetic = SyntheticProperty | SyntheticMethod,
        Discriminant = HasNonUniformType | HasLiteralType,
        Partial = ReadPartial | WritePartial,
    }
}
