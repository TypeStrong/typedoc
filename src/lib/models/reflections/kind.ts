/**
 * Defines the available reflection kinds.
 */
export enum ReflectionKind {
    Project = 0x1,
    Module = 0x2,
    Namespace = 0x4,
    Enum = 0x8,
    EnumMember = 0x10,
    Variable = 0x20,
    Function = 0x40,
    Class = 0x80,
    Interface = 0x100,
    Constructor = 0x200,
    Property = 0x400,
    Method = 0x800,
    CallSignature = 0x1000,
    IndexSignature = 0x2000,
    ConstructorSignature = 0x4000,
    Parameter = 0x8000,
    TypeLiteral = 0x10000,
    TypeParameter = 0x20000,
    Accessor = 0x40000,
    GetSignature = 0x80000,
    SetSignature = 0x100000,
    ObjectLiteral = 0x200000,
    TypeAlias = 0x400000,
    Reference = 0x800000,
}

export namespace ReflectionKind {
    // Would be nice to derive this...
    export type KindString =
        | "Project"
        | "Module"
        | "Namespace"
        | "Enum"
        | "EnumMember"
        | "Variable"
        | "Function"
        | "Class"
        | "Interface"
        | "Constructor"
        | "Property"
        | "Method"
        | "CallSignature"
        | "IndexSignature"
        | "ConstructorSignature"
        | "Parameter"
        | "TypeLiteral"
        | "TypeParameter"
        | "Accessor"
        | "GetSignature"
        | "SetSignature"
        | "ObjectLiteral"
        | "TypeAlias"
        | "Reference";

    export const All = ReflectionKind.Reference * 2 - 1;

    /** @internal */
    export const ClassOrInterface =
        ReflectionKind.Class | ReflectionKind.Interface;
    /** @internal */
    export const VariableOrProperty =
        ReflectionKind.Variable | ReflectionKind.Property;
    /** @internal */
    export const FunctionOrMethod =
        ReflectionKind.Function | ReflectionKind.Method;
    /** @internal */
    export const ClassMember =
        ReflectionKind.Accessor |
        ReflectionKind.Constructor |
        ReflectionKind.Method |
        ReflectionKind.Property;
    /** @internal */
    export const SomeSignature =
        ReflectionKind.CallSignature |
        ReflectionKind.IndexSignature |
        ReflectionKind.ConstructorSignature |
        ReflectionKind.GetSignature |
        ReflectionKind.SetSignature;
    /** @internal */
    export const SomeModule = ReflectionKind.Namespace | ReflectionKind.Module;
    /** @internal */
    export const SomeType =
        ReflectionKind.Interface |
        ReflectionKind.TypeLiteral |
        ReflectionKind.TypeParameter |
        ReflectionKind.TypeAlias;
    /** @internal */
    export const SomeValue =
        ReflectionKind.Variable |
        ReflectionKind.Function |
        ReflectionKind.ObjectLiteral;
    /** @internal */
    export const SomeMember =
        ReflectionKind.EnumMember |
        ReflectionKind.Property |
        ReflectionKind.Method |
        ReflectionKind.Accessor;
    /** @internal */
    export const SomeExport =
        ReflectionKind.Module |
        ReflectionKind.Namespace |
        ReflectionKind.Enum |
        ReflectionKind.Variable |
        ReflectionKind.Function |
        ReflectionKind.Class |
        ReflectionKind.Interface |
        ReflectionKind.TypeAlias |
        ReflectionKind.Reference;
    /** @internal */
    export const ExportContainer =
        ReflectionKind.SomeModule | ReflectionKind.Project;

    /** @internal */
    export const Inheritable =
        ReflectionKind.Accessor |
        ReflectionKind.IndexSignature |
        ReflectionKind.Property |
        ReflectionKind.Method |
        ReflectionKind.Constructor;

    /** @internal */
    export const ContainsCallSignatures =
        ReflectionKind.Constructor |
        ReflectionKind.Function |
        ReflectionKind.Method;

    const SINGULARS = {
        [ReflectionKind.Enum]: "Enumeration",
        [ReflectionKind.EnumMember]: "Enumeration Member",
    };

    const PLURALS = {
        [ReflectionKind.Class]: "Classes",
        [ReflectionKind.Property]: "Properties",
        [ReflectionKind.Enum]: "Enumerations",
        [ReflectionKind.EnumMember]: "Enumeration Members",
        [ReflectionKind.TypeAlias]: "Type Aliases",
    };

    export function singularString(kind: ReflectionKind): string {
        if (kind in SINGULARS) {
            return SINGULARS[kind as keyof typeof SINGULARS];
        } else {
            return getKindString(kind);
        }
    }

    export function pluralString(kind: ReflectionKind): string {
        if (kind in PLURALS) {
            return PLURALS[kind as keyof typeof PLURALS];
        } else {
            return getKindString(kind) + "s";
        }
    }
}

function getKindString(kind: ReflectionKind): string {
    return ReflectionKind[kind].replace(
        /(.)([A-Z])/g,
        (_m, a, b) => a + " " + b.toLowerCase()
    );
}
