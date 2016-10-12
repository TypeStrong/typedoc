import { ISourceReference } from "../sources/file";
import { Type } from "../types/index";
import { Comment } from "../comments/comment";
import { TypeParameterReflection } from "./type-parameter";
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
}
export declare enum ReflectionFlag {
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
}
export interface IReflectionFlags extends Array<string> {
    flags?: ReflectionFlag;
    isPrivate?: boolean;
    isProtected?: boolean;
    isPublic?: boolean;
    isStatic?: boolean;
    isExported?: boolean;
    isExternal?: boolean;
    isOptional?: boolean;
    isRest?: boolean;
    hasExportAssignment?: boolean;
    isConstructorProperty?: boolean;
}
export interface IDefaultValueContainer extends Reflection {
    defaultValue: string;
}
export interface ITypeContainer extends Reflection {
    type: Type;
}
export interface ITypeParameterContainer extends Reflection {
    typeParameters: TypeParameterReflection[];
}
export declare enum TraverseProperty {
    Children = 0,
    Parameters = 1,
    TypeLiteral = 2,
    TypeParameter = 3,
    Signatures = 4,
    IndexSignature = 5,
    GetSignature = 6,
    SetSignature = 7,
}
export interface ITraverseCallback {
    (reflection: Reflection, property: TraverseProperty): void;
}
export interface IDecorator {
    name: string;
    type?: Type;
    arguments?: any;
}
export declare abstract class Reflection {
    id: number;
    name: string;
    originalName: string;
    kind: ReflectionKind;
    kindString: string;
    flags: IReflectionFlags;
    parent: Reflection;
    comment: Comment;
    sources: ISourceReference[];
    decorators: IDecorator[];
    decorates: Type[];
    url: string;
    anchor: string;
    hasOwnDocument: boolean;
    cssClasses: string;
    private _alias;
    private _aliases;
    constructor(parent?: Reflection, name?: string, kind?: ReflectionKind);
    kindOf(kind: ReflectionKind): boolean;
    kindOf(kind: ReflectionKind[]): boolean;
    getFullName(separator?: string): string;
    setFlag(flag: ReflectionFlag, value?: boolean): void;
    getAlias(): string;
    hasComment(): boolean;
    hasGetterOrSetter(): boolean;
    getChildByName(name: string): Reflection;
    getChildByName(names: string[]): Reflection;
    isProject(): boolean;
    findReflectionByName(name: string): Reflection;
    findReflectionByName(names: string[]): Reflection;
    traverse(callback: ITraverseCallback): void;
    toObject(): any;
    toString(): string;
    toStringHierarchy(indent?: string): string;
}
