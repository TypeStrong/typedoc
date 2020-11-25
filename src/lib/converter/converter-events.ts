export const ConverterEvents = {
    BEGIN: "begin",
    END: "end",
    /** @deprecated */
    FILE_BEGIN: "fileBegin",
    CREATE_DECLARATION: "createDeclaration",
    CREATE_SIGNATURE: "createSignature",
    CREATE_PARAMETER: "createParameter",
    CREATE_TYPE_PARAMETER: "createTypeParameter",
    FUNCTION_IMPLEMENTATION: "functionImplementation",
    RESOLVE_BEGIN: "resolveBegin",
    RESOLVE: "resolveReflection",
    RESOLVE_END: "resolveEnd",
} as const;
