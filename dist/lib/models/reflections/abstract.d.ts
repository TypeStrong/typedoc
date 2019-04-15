import { SourceReference } from '../sources/file';
import { Type } from '../types/index';
import { Comment } from '../comments/comment';
import { TypeParameterReflection } from './type-parameter';
export declare function resetReflectionID(): void;
export declare enum ReflectionKind {
    Global = 0,
    ExternalModule = 1,
    Module = 2,
    Enum = 4,
    EnumMember = 16,
    Variable = 32,
    Function = 64,
    Class = 128,
    Interface = 256,
    Constructor = 512,
    Property = 1024,
    Method = 2048,
    CallSignature = 4096,
    IndexSignature = 8192,
    ConstructorSignature = 16384,
    Parameter = 32768,
    TypeLiteral = 65536,
    TypeParameter = 131072,
    Accessor = 262144,
    GetSignature = 524288,
    SetSignature = 1048576,
    ObjectLiteral = 2097152,
    TypeAlias = 4194304,
    Event = 8388608,
    ClassOrInterface = 384,
    VariableOrProperty = 1056,
    FunctionOrMethod = 2112,
    SomeSignature = 1601536,
    SomeModule = 3,
    SomeType = 4391168,
    SomeValue = 2097248
}
export declare enum ReflectionFlag {
    None = 0,
    Private = 1,
    Protected = 2,
    Public = 4,
    Static = 8,
    Exported = 16,
    ExportAssignment = 32,
    External = 64,
    Optional = 128,
    DefaultValue = 256,
    Rest = 512,
    ConstructorProperty = 1024,
    Abstract = 2048,
    Const = 4096,
    Let = 8192
}
export declare class ReflectionFlags extends Array<string> {
    private flags;
    hasFlag(flag: ReflectionFlag): boolean;
    readonly isPrivate: boolean;
    readonly isProtected: boolean;
    readonly isPublic: boolean;
    readonly isStatic: boolean;
    readonly isExported: boolean;
    readonly isExternal: boolean;
    readonly isOptional: boolean;
    readonly isRest: boolean;
    readonly hasExportAssignment: boolean;
    readonly isConstructorProperty: boolean;
    readonly isAbstract: boolean;
    readonly isConst: boolean;
    readonly isLet: boolean;
    setFlag(flag: ReflectionFlag, set: boolean): void;
    private setSingleFlag;
}
export interface DefaultValueContainer extends Reflection {
    defaultValue?: string;
}
export interface TypeContainer extends Reflection {
    type?: Type;
}
export interface TypeParameterContainer extends Reflection {
    typeParameters?: TypeParameterReflection[];
}
export declare enum TraverseProperty {
    Children = 0,
    Parameters = 1,
    TypeLiteral = 2,
    TypeParameter = 3,
    Signatures = 4,
    IndexSignature = 5,
    GetSignature = 6,
    SetSignature = 7
}
export interface TraverseCallback {
    (reflection: Reflection, property: TraverseProperty): void;
}
export interface Decorator {
    name: string;
    type?: Type;
    arguments?: any;
}
export declare abstract class Reflection {
    id: number;
    name: string;
    originalName: string;
    kind: ReflectionKind;
    kindString?: string;
    flags: ReflectionFlags;
    parent?: Reflection;
    comment?: Comment;
    sources?: SourceReference[];
    decorators?: Decorator[];
    decorates?: Type[];
    url?: string;
    anchor?: string;
    hasOwnDocument?: boolean;
    cssClasses?: string;
    private _alias?;
    private _aliases?;
    constructor(name: string, kind: ReflectionKind, parent?: Reflection);
    kindOf(kind: ReflectionKind | ReflectionKind[]): boolean;
    getFullName(separator?: string): string;
    setFlag(flag: ReflectionFlag, value?: boolean): void;
    getAlias(): string;
    hasComment(): boolean;
    hasGetterOrSetter(): boolean;
    getChildByName(name: string): Reflection;
    getChildByName(names: string[]): Reflection;
    isProject(): boolean;
    findReflectionByName(arg: string | string[]): Reflection | undefined;
    traverse(callback: TraverseCallback): void;
    toObject(): any;
    toString(): string;
    toStringHierarchy(indent?: string): string;
}
