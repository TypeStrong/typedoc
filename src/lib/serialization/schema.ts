/**
 * Documents the exported JSON schema. The root object is a [[JSONOutput.ProjectReflection]].
 */

/** */
import * as M from '../models';
import { SourceReferenceWrapper, DecoratorWrapper } from './serializers';

/**
 * Describes the mapping from Model types to the corresponding JSON output type.
 */
export type ModelToObject<T> = T extends Array<infer U> ? _ModelToObject<U>[] : _ModelToObject<T>;

// Order matters here. Some types are subtypes of other types.
type _ModelToObject<T> =
    // Reflections
    T extends M.ReflectionGroup ? JSONOutput.ReflectionGroup :
    T extends M.ReflectionCategory ? JSONOutput.ReflectionCategory :
    T extends M.SignatureReflection ? JSONOutput.SignatureReflection :
    T extends M.ParameterReflection ? JSONOutput.ParameterReflection :
    T extends M.DeclarationReflection ? JSONOutput.DeclarationReflection | JSONOutput.ReflectionPointer :
    T extends M.TypeParameterReflection ? JSONOutput.TypeParameterReflection :
    T extends M.ProjectReflection ? JSONOutput.ProjectReflection :
    T extends M.ContainerReflection ? JSONOutput.ContainerReflection :
    T extends M.Reflection ? JSONOutput.Reflection :
    // Types
    T extends M.ArrayType ? JSONOutput.ArrayType :
    T extends M.IntersectionType ? JSONOutput.IntersectionType :
    T extends M.IntrinsicType ? JSONOutput.IntrinsicType :
    T extends M.ReferenceType ? JSONOutput.ReferenceType :
    T extends M.ReflectionType ? JSONOutput.ReflectionType :
    T extends M.StringLiteralType ? JSONOutput.StringLiteralType :
    T extends M.TupleType ? JSONOutput.TupleType :
    T extends M.UnknownType ? JSONOutput.UnknownType :
    T extends M.Type ? JSONOutput.SomeType : // Technically AbstractType, but the union is more useful
    // Miscellaneous
    T extends M.Comment ? JSONOutput.Comment :
    T extends M.CommentTag ? JSONOutput.CommentTag :
    T extends DecoratorWrapper ? JSONOutput.Decorator :
    T extends SourceReferenceWrapper ? JSONOutput.SourceReference :
    never;

/**
 * Contains interfaces which describe the JSON output. Each interface is related to a specific type of serializer.
 *
 * ## Plugins
 * Plugins which modify the serialization process can use declaration merging
 * to add custom properties to the exported interfaces.
 * For example, if your custom serializer adds a property to all [[Reflection]] objects:
 * ```ts
 * declare module 'typedoc/dist/lib/serialization/schema' {
 *     export namespace JSONOutput {
 *         export interface AbstractReflection {
 *             myCustomProp: boolean
 *         }
 *     }
 * }
 * ```
 *
 * If a plugin defines a new Model type, [[ModelToObject]] will not pick up the serializer type.
 * To fix this, use declaration merging to augment the [[Serializer]] class.
 * ```ts
 * declare module 'typedoc/dist/lib/serialization/serializer' {
 *     export interface Serializer {
 *         toObject(value: CustomModel, obj?: Partial<CustomModel>): CustomOutput
 *     }
 * }
 * ```
 *
 * For documentation on the JSON output properties, view the corresponding model.
 */
export namespace JSONOutput {

    // Reflections

    export interface ReflectionGroup {
        title: M.ReflectionGroup['title'];
        kind: M.ReflectionGroup['kind'];
        children?: M.ReflectionGroup['children'][number]['id'][];
        categories?: ModelToObject<M.ReflectionGroup['categories']>;
    }

    export interface ReflectionCategory {
        title: M.ReflectionCategory['title'];
        children?: M.ReflectionCategory['children'][number]['id'][];
    }

    export interface SignatureReflection extends Reflection {
        type?: ModelToObject<M.SignatureReflection['implementationOf']>;
        overwrites?: ModelToObject<M.SignatureReflection['implementationOf']>;
        inheritedFrom?: ModelToObject<M.SignatureReflection['implementationOf']>;
        implementationOf?: ModelToObject<M.SignatureReflection['implementationOf']>;
    }

    export interface ParameterReflection extends Reflection {
        type?: ModelToObject<M.ParameterReflection['type']>;
        defaultValue?: M.ParameterReflection['defaultValue'];
    }

    export interface DeclarationReflection extends ContainerReflection {
        type?: ModelToObject<M.DeclarationReflection['type']>;
        defaultValue?: M.DeclarationReflection['defaultValue'];
        overwrites?: ModelToObject<M.DeclarationReflection['overwrites']>;
        inheritedFrom?: ModelToObject<M.DeclarationReflection['inheritedFrom']>;
        extendedTypes?: ModelToObject<M.DeclarationReflection['extendedTypes']>;
        extendedBy?: ModelToObject<M.DeclarationReflection['extendedBy']>;
        implementedTypes?: ModelToObject<M.DeclarationReflection['implementedTypes']>;
        implementedBy?: ModelToObject<M.DeclarationReflection['implementedBy']>;
        implementationOf?: ModelToObject<M.DeclarationReflection['implementationOf']>;
    }

    export interface TypeParameterReflection extends Reflection {
        type?: ModelToObject<M.TypeParameterReflection['type']>;
    }

    // Nothing extra yet.
    export interface ProjectReflection extends ContainerReflection { }

    export interface ContainerReflection extends Reflection {
        groups?: ModelToObject<M.ContainerReflection['groups']>;
        categories?: ModelToObject<M.ContainerReflection['categories']>;
        sources?: ModelToObject<SourceReferenceWrapper[]>;
    }

    /**
     * If a 3rd party serializer creates a loop when serializing, a pointer will be created
     * instead of re-serializing the [[DeclarationReflection]]
     */
    export interface ReflectionPointer {
        id: M.Reflection['id'];
    }

    export interface Reflection {
        id: M.Reflection['id'];
        name: M.Reflection['name'];
        originalName?: M.Reflection['originalName'];
        kind: M.Reflection['kind'];
        kindString: M.Reflection['kindString'];
        flags: ReflectionFlags;
        comment?: ModelToObject<M.Reflection['comment']>;
        decorates?: ModelToObject<M.Reflection['decorates']>;
        decorators?: ModelToObject<DecoratorWrapper[]>;
    }

    // Types

    export type SomeType =
        | ArrayType
        | IntersectionType
        | UnionType
        | IntrinsicType
        | ReferenceType
        | ReflectionType
        | StringLiteralType
        | TupleType
        | TypeOperatorType
        | TypeParameterType
        | UnionType
        | UnknownType;

    export interface ArrayType extends Type<M.ArrayType> {
        elementType: ModelToObject<M.ArrayType['elementType']>;
    }

    export interface IntersectionType extends Type<M.IntersectionType> {
        types: ModelToObject<M.IntersectionType['types']>;
    }

    export interface UnionType extends Type<M.UnionType> {
        types: ModelToObject<M.UnionType['types']>;
    }

    export interface IntrinsicType extends Type<M.IntrinsicType> {
        name: M.IntrinsicType['name'];
    }

    export interface ReferenceType extends Type<M.ReferenceType> {
        name: M.ReferenceType['name'];
        id?: number;
        typeArguments?: ModelToObject<M.ReferenceType['typeArguments']>;
    }

    export interface ReflectionType extends Type<M.ReflectionType> {
        declaration?: ModelToObject<M.ReflectionType['declaration']>;
    }

    export interface StringLiteralType extends Type<M.StringLiteralType> {
        value: M.StringLiteralType['value'];
    }

    export interface TupleType extends Type<M.TupleType> {
        elements?: ModelToObject<M.TupleType['elements']>;
    }

    export interface TypeOperatorType extends Type<M.TypeOperatorType> {
        operator: M.TypeOperatorType['operator'];
        target: ModelToObject<M.TypeOperatorType['target']>;
    }

    export interface TypeParameterType extends Type<M.TypeParameterType> {
        name: M.TypeParameterType['name'];
        constraint?: ModelToObject<M.TypeParameterType['constraint']>;
    }

    export interface UnknownType extends Type<M.UnknownType> {
        name: M.UnknownType['name'];
    }

    export interface Type<T extends M.Type> {
        type: T['type'];
    }

    // Miscellaneous

    export interface ReflectionFlags {
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
        isAbstract?: boolean;
        isConst?: boolean;
        isLet?: boolean;
    }

    export interface Comment {
        shortText?: M.Comment['shortText'];
        text?: M.Comment['text'];
        returns?: M.Comment['returns'];
        tags?: ModelToObject<M.Comment['tags']>;
    }

    export interface CommentTag {
        tag: M.CommentTag['tagName'];
        text: M.CommentTag['text'];
        param?: M.CommentTag['paramName'];
    }

    export interface SourceReference {
        fileName: M.SourceReference['fileName'];
        line: M.SourceReference['line'];
        character: M.SourceReference['character'];
    }

    export interface Decorator {
        name: M.Decorator['name'];
        type?: ModelToObject<M.Decorator['type']>;
        arguments?: M.Decorator['arguments'];
    }
}
