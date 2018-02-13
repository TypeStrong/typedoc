export interface ReflectionContainer {
    id: number;
    name: string;
    kind: number;
    kindString: string;
    flags: ReflectionFlagsObject;
    originalName?: string;
}
export interface DefaultValueContainer {
    defaultValue: string;
}
export interface TypeContainer {
    type: TypeObject;
}
export interface TypeParameterContainer {
    typeParameters: TypeContainer[];
}
export interface DecoratesContainer {
    decorates: TypeObject[];
}
export interface DecoratorsContainer<T> {
    decorators: T[];
}
export interface SourceReferenceContainer<T> {
    sources: T[];
}
export interface GroupsContainer<T> {
    groups: T[];
}
export interface ContainerReflectionContainer<TChildren> {
    children: TChildren[];
}
export interface CommentContainer<TComment> {
    comment: TComment;
}
export interface SignatureReflectionContainer<TParameters> {
    overwrites?: TypeObject;
    inheritedFrom?: TypeObject;
    implementationOf?: TypeObject;
    parameters?: TParameters[];
}
export interface DeclarationReflectionContainer<T> {
    signatures?: T[];
    indexSignature?: T[];
    getSignature?: T[];
    setSignature?: T[];
    extendedTypes?: TypeObject[];
    extendedBy?: TypeObject[];
    implementedTypes?: TypeObject[];
    implementedBy?: TypeObject[];
}
export interface ReflectionObject extends ReflectionContainer, Partial<CommentContainer<CommentObject>>, Partial<DecoratesContainer>, Partial<DecoratorsContainer<DecoratorObject>> {
}
export interface ParameterReflectionObject extends ReflectionObject, TypeContainer, DefaultValueContainer {
}
export interface ContainerReflectionObject extends ReflectionObject, Partial<SourceReferenceContainer<SourceReferenceObject>>, Partial<GroupsContainer<ReflectionGroupObject>>, ContainerReflectionContainer<ReflectionObject> {
}
export interface DeclarationReflectionObject extends ContainerReflectionObject, DefaultValueContainer, Partial<TypeContainer>, Partial<TypeParameterContainer>, Partial<SignatureReflectionContainer<ParameterReflectionObject>>, DeclarationReflectionContainer<SignatureReflectionObject> {
}
export interface SignatureReflectionObject extends ReflectionObject, Partial<SignatureReflectionContainer<ParameterReflectionObject>>, Partial<TypeContainer>, Partial<TypeParameterContainer> {
}
export interface CommentObject {
    shortText?: string;
    text?: string;
    returns?: string;
    tags?: CommentTagObject[];
}
export interface CommentTagObject {
    tag: string;
    text: string;
    param?: string;
}
export interface DecoratorObject {
    name: string;
    type?: TypeObject;
    arguments?: any;
}
export interface ProjectReflectionObject extends ContainerReflectionObject {
}
export interface SourceReferenceObject {
    fileName: string;
    line: number;
    character: number;
}
export interface TypeObject {
    type: 'void' | 'array' | 'intersection' | 'intrinsic' | 'reference' | 'reflection' | 'stringLiteral' | 'tuple' | 'typeParameter' | 'union' | 'unknown' | string;
    elementType?: TypeObject;
    types?: TypeObject[];
    name?: 'Object' | 'string' | 'number' | 'boolean' | 'this' | string;
    id?: number;
    typeArguments?: TypeObject[];
    declaration?: ReflectionObject;
    value?: string;
    elements?: TypeObject[];
    constraint?: TypeObject;
}
export interface ReflectionGroupObject {
    title: string;
    kind: number;
    children?: number[];
}
export interface ReflectionFlagsObject {
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
