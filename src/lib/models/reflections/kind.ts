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
    Event = 0x800000,
    Reference = 0x1000000,
}

/** @hidden */
export namespace ReflectionKind {
    export const All = ReflectionKind.Reference * 2 - 1;

    export const ClassOrInterface =
        ReflectionKind.Class | ReflectionKind.Interface;
    export const VariableOrProperty =
        ReflectionKind.Variable | ReflectionKind.Property;
    export const FunctionOrMethod =
        ReflectionKind.Function | ReflectionKind.Method;
    export const ClassMember =
        ReflectionKind.Accessor |
        ReflectionKind.Constructor |
        ReflectionKind.Method |
        ReflectionKind.Property |
        ReflectionKind.Event;
    export const SomeSignature =
        ReflectionKind.CallSignature |
        ReflectionKind.IndexSignature |
        ReflectionKind.ConstructorSignature |
        ReflectionKind.GetSignature |
        ReflectionKind.SetSignature;
    export const SomeModule = ReflectionKind.Namespace | ReflectionKind.Module;
    export const SomeType =
        ReflectionKind.Interface |
        ReflectionKind.TypeLiteral |
        ReflectionKind.TypeParameter |
        ReflectionKind.TypeAlias;
    export const SomeValue =
        ReflectionKind.Variable |
        ReflectionKind.Function |
        ReflectionKind.ObjectLiteral;

    /** @internal */
    export const Inheritable =
        ReflectionKind.Accessor |
        ReflectionKind.IndexSignature |
        ReflectionKind.Property |
        ReflectionKind.Method |
        ReflectionKind.Constructor;
}
