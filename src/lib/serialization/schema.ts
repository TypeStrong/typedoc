/**
 * Contains interfaces which describe the JSON output. Each interface is related to a specific type of serializer.
 *
 * ## Plugins
 * Plugins which modify the serialization process can use declaration merging
 * to add custom properties to the exported interfaces.
 * For example, if your custom serializer adds a property to all {@link Reflection} objects:
 * ```ts
 * declare module 'typedoc/dist/lib/serialization/schema' {
 *     export interface AbstractReflection {
 *         myCustomProp: boolean
 *     }
 * }
 * ```
 *
 * If a plugin defines a new Model type, {@link ModelToObject} will not pick up the serializer type and
 * the resulting type will not be included in the return type of {@link Serializer.toObject}.
 * To fix this, use declaration merging to augment the {@link Serializer} class.
 * ```ts
 * declare module 'typedoc/dist/lib/serialization/serializer' {
 *     export interface Serializer {
 *         toObject(value: CustomModel, obj?: Partial<CustomModel>): CustomOutput
 *     }
 * }
 * ```
 *
 * For documentation on the JSON output properties, view the corresponding model.
 * @module
 */

import type * as M from "../models";

/**
 * Describes the mapping from Model types to the corresponding JSON output type.
 */
export type ModelToObject<T> = T extends Array<infer U>
    ? _ModelToObject<U>[]
    : _ModelToObject<T>;

// Order matters here. Some types are subtypes of other types.
type _ModelToObject<T> =
    // Reflections
    T extends Primitive
        ? T
        : T extends M.ReflectionGroup
        ? ReflectionGroup
        : T extends M.ReflectionCategory
        ? ReflectionCategory
        : T extends M.SignatureReflection
        ? SignatureReflection
        : T extends M.ParameterReflection
        ? ParameterReflection
        : T extends M.DeclarationReflection
        ? DeclarationReflection
        : T extends M.TypeParameterReflection
        ? TypeParameterReflection
        : T extends M.ProjectReflection
        ? ProjectReflection
        : T extends M.ContainerReflection
        ? ContainerReflection
        : T extends M.ReferenceReflection
        ? ReferenceReflection
        : T extends M.Reflection
        ? Reflection
        : // Types
        T extends M.SomeType
        ? TypeKindMap[T["type"]]
        : T extends M.Type
        ? SomeType
        : // Miscellaneous
        T extends M.Comment
        ? Comment
        : T extends M.CommentTag
        ? CommentTag
        : T extends M.CommentDisplayPart
        ? CommentDisplayPart
        : T extends M.SourceReference
        ? SourceReference
        : never;

type Primitive = string | number | undefined | null | boolean;

// Separate helper so that we can trigger distribution.
type ToSerialized<T> = T extends Primitive
    ? T
    : T extends bigint
    ? { value: string; negative: boolean }
    : ModelToObject<T>;

/**
 * Helper to describe a set of serialized properties. Primitive types are returned
 * directly, while other models are first passed through ModelToObject.
 * This helper removes the readonly modifier from properties since the result of serialization
 * is a plain object that consumers may modify as they choose, TypeDoc doesn't care.
 */
type S<T, K extends keyof T> = {
    -readonly [K2 in K]: ToSerialized<T[K2]>;
};

// Reflections

export interface ReflectionGroup
    extends S<M.ReflectionGroup, "title" | "kind" | "categories"> {
    children?: M.ReflectionGroup["children"][number]["id"][];
}

export interface ReflectionCategory extends S<M.ReflectionCategory, "title"> {
    children?: M.ReflectionCategory["children"][number]["id"][];
}

export interface ReferenceReflection
    extends DeclarationReflection,
        S<M.ReferenceReflection, never> {
    /**
     * -1 if the reference refers to a symbol that does not exist in the documentation.
     * Otherwise, the reflection ID.
     */
    target: number;
}

export interface SignatureReflection
    extends Reflection,
        S<
            M.SignatureReflection,
            | "parameters"
            | "type"
            | "overwrites"
            | "inheritedFrom"
            | "implementationOf"
        > {
    // Weird not to call this typeParameters... preserving backwards compatibility for now.
    typeParameter?: ModelToObject<M.SignatureReflection["typeParameters"]>;
}

export interface ParameterReflection
    extends Reflection,
        S<M.ParameterReflection, "type" | "defaultValue"> {}

export interface DeclarationReflection
    extends ContainerReflection,
        S<
            M.DeclarationReflection,
            | "type"
            | "signatures"
            | "indexSignature"
            | "defaultValue"
            | "overwrites"
            | "inheritedFrom"
            | "implementationOf"
            | "extendedTypes"
            | "extendedBy"
            | "implementedTypes"
            | "implementedBy"
        > {
    // Weird not to call this typeParameters... preserving backwards compatibility for now.
    typeParameter?: ModelToObject<M.DeclarationReflection["typeParameters"]>;

    // Yep... backwards compatibility. This is an optional one-tuple.
    getSignature?: [ModelToObject<M.DeclarationReflection["getSignature"]>];

    // Yep... backwards compatibility. This is an optional one-tuple.
    setSignature?: [ModelToObject<M.DeclarationReflection["setSignature"]>];
}

export interface TypeParameterReflection
    extends Reflection,
        S<M.TypeParameterReflection, "type" | "default"> {}

// Nothing extra yet.
export interface ProjectReflection extends ContainerReflection {}

export interface ContainerReflection
    extends Reflection,
        S<
            M.ContainerReflection,
            "children" | "groups" | "categories" | "sources"
        > {}

export interface Reflection
    extends S<M.Reflection, "id" | "name" | "kind" | "kindString" | "comment"> {
    /** Will not be present if name === originalName */
    originalName?: M.Reflection["originalName"];
    flags: ReflectionFlags;
}

// Types

export type SomeType = ModelToObject<M.SomeType>;

export type TypeKindMap = {
    array: ArrayType;
    conditional: ConditionalType;
    indexedAccess: IndexedAccessType;
    inferred: InferredType;
    intersection: IntersectionType;
    intrinsic: IntrinsicType;
    literal: LiteralType;
    mapped: MappedType;
    optional: OptionalType;
    predicate: PredicateType;
    query: QueryType;
    reference: ReferenceType;
    reflection: ReflectionType;
    rest: RestType;
    "template-literal": TemplateLiteralType;
    tuple: TupleType;
    "named-tuple-member": NamedTupleMemberType;
    typeOperator: TypeOperatorType;
    union: UnionType;
    unknown: UnknownType;
};

export interface ArrayType
    extends Type,
        S<M.ArrayType, "type" | "elementType"> {}

export interface ConditionalType
    extends Type,
        S<
            M.ConditionalType,
            "type" | "checkType" | "extendsType" | "trueType" | "falseType"
        > {}

export interface IndexedAccessType
    extends Type,
        S<M.IndexedAccessType, "type" | "indexType" | "objectType"> {}

export interface InferredType
    extends Type,
        S<M.InferredType, "type" | "name"> {}

export interface IntersectionType
    extends Type,
        S<M.IntersectionType, "type" | "types"> {}

export interface IntrinsicType
    extends Type,
        S<M.IntrinsicType, "type" | "name"> {}

export interface OptionalType
    extends Type,
        S<M.OptionalType, "type" | "elementType"> {}

export interface PredicateType
    extends Type,
        S<M.PredicateType, "type" | "name" | "asserts" | "targetType"> {}

export interface QueryType extends Type, S<M.QueryType, "type" | "queryType"> {}

export interface ReferenceType
    extends Type,
        S<
            M.ReferenceType,
            "type" | "name" | "typeArguments" | "qualifiedName" | "package"
        > {
    id?: number;
}

export interface ReflectionType extends Type, S<M.ReflectionType, "type"> {
    declaration?: ModelToObject<M.ReflectionType["declaration"]>;
}

export interface RestType extends Type, S<M.RestType, "type" | "elementType"> {}

export interface LiteralType extends Type, S<M.LiteralType, "type" | "value"> {}

export interface TupleType extends Type, S<M.TupleType, "type"> {
    elements?: ModelToObject<M.TupleType["elements"]>;
}

export interface NamedTupleMemberType
    extends Type,
        S<M.NamedTupleMember, "type" | "name" | "isOptional" | "element"> {}

export interface TemplateLiteralType
    extends Type,
        S<M.TemplateLiteralType, "type" | "head"> {
    tail: [SomeType, string][];
}

export interface MappedType
    extends Type,
        S<
            M.MappedType,
            | "type"
            | "parameter"
            | "parameterType"
            | "templateType"
            | "readonlyModifier"
            | "optionalModifier"
            | "nameType"
        > {}

export interface TypeOperatorType
    extends Type,
        S<M.TypeOperatorType, "type" | "operator" | "target"> {}

export interface UnionType extends Type, S<M.UnionType, "type" | "types"> {}

export interface UnknownType extends Type, S<M.UnknownType, "type" | "name"> {}

export interface Type {}

// Miscellaneous

type BoolKeys<T> = {
    [K in keyof T]-?: T[K] extends boolean ? K : never;
}[keyof T];

export interface ReflectionFlags
    extends Partial<S<M.ReflectionFlags, BoolKeys<M.ReflectionFlags>>> {}

export interface Comment extends Partial<S<M.Comment, "blockTags">> {
    summary: CommentDisplayPart[];
    modifierTags?: string[];
}

export interface CommentTag extends S<M.CommentTag, "tag" | "name"> {
    content: CommentDisplayPart[];
}

/**
 * If `target` is a number, it is a reflection ID. If a string, it is a URL.
 * `target` will only be set for `@link`, `@linkcode`, and `@linkplain` tags.
 */
export type CommentDisplayPart =
    | { kind: "text"; text: string }
    | { kind: "code"; text: string }
    | {
          kind: "inline-tag";
          tag: `@${string}`;
          text: string;
          target?: string | number;
      };

export interface SourceReference
    extends S<M.SourceReference, "fileName" | "line" | "character"> {}
