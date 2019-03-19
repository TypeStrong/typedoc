/**
 * Shared serialized symbols
 * The shared symbols can be used in node or in a browser web application.
 *
 * There are 2 types of symbols:
 *   - Object
 *   - Container
 *
 * ## Object
 * Object symbols (XXXObject) represents the final structure of a JSON object after it was
 * serialized by the native typedoc serializers. It is a type composition of Container symbols.
 *
 * ## Container
 * Container symbols (XXXContainer) are partial symbols used to compose an Object symbol.
 *
 * ## Object vs Container symbols
 * While Container symbols might look redundant they are not, when an external serialization plugin
 * is used it will, most likely, alter the structure of the output, the plugin can then use the
 * Container symbols to expose custom Object symbols with minimal effort.
 */

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

export interface TypeContainer  {
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

export interface CategoriesContainer<T> {
  categories: T[];
}

export interface ContainerReflectionContainer<TChildren> {
  children: TChildren[];
}

export interface CommentContainer<TComment> {
  comment: TComment;
}

export interface SignatureReflectionContainer<TParameters> {
  /**
   * A type that points to the reflection that has been overwritten by this reflection.
   *
   * Applies to interface and class members.
   */
  overwrites?: TypeObject;

  /**
   * A type that points to the reflection this reflection has been inherited from.
   *
   * Applies to interface and class members.
   */
  inheritedFrom?: TypeObject;

  /**
   * A type that points to the reflection this reflection is the implementation of.
   *
   * Applies to class members.
   */
  implementationOf?: TypeObject;

  parameters?: TParameters[];
}

export interface DeclarationReflectionContainer<T> {
  /**
   * A list of call signatures attached to this declaration.
   *
   * TypeDoc creates one declaration per function that may contain ore or more
   * signature reflections.
   */
  signatures?: T[];

  /**
   * The index signature of this declaration.
   */
  indexSignature?: T[];

  /**
   * The get signature of this declaration.
   */
  getSignature?: T[];

  /**
   * The set signature of this declaration.
   */
  setSignature?: T[];

  /**
   * A list of all types this reflection extends (e.g. the parent classes).
   */
  extendedTypes?: TypeObject[];

  /**
   * A list of all types that extend this reflection (e.g. the subclasses).
   */
  extendedBy?: TypeObject[];

  /**
   * A list of all types this reflection implements.
   */
  implementedTypes?: TypeObject[];

  /**
   * A list of all types that implement this reflection.
   */
  implementedBy?: TypeObject[];

}

export interface ReflectionObject extends ReflectionContainer,
                                          Partial<CommentContainer<CommentObject>>,
                                          Partial<DecoratesContainer>,
                                          Partial<DecoratorsContainer<DecoratorObject>> { }

export interface ParameterReflectionObject extends  ReflectionObject,
                                                    TypeContainer,
                                                    DefaultValueContainer {}

export interface ContainerReflectionObject extends  ReflectionObject,
                                                    Partial<SourceReferenceContainer<SourceReferenceObject>>,
                                                    Partial<GroupsContainer<ReflectionGroupObject>>,
                                                    Partial<CategoriesContainer<ReflectionCategoryObject>>,
                                                    ContainerReflectionContainer<ReflectionObject> {}

export interface DeclarationReflectionObject extends  ContainerReflectionObject,
                                                      DefaultValueContainer,
                                                      Partial<TypeContainer>,
                                                      Partial<TypeParameterContainer>,
                                                      Partial<SignatureReflectionContainer<ParameterReflectionObject>>,
                                                      DeclarationReflectionContainer<SignatureReflectionObject> {}

export interface SignatureReflectionObject extends  ReflectionObject,
                                                    Partial<SignatureReflectionContainer<ParameterReflectionObject>>,
                                                    Partial<TypeContainer>,
                                                    Partial<TypeParameterContainer> { }

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
  /**
   * The name of the decorator being applied.
   */
  name: string;

  /**
   * The type declaring the decorator.
   * Usually a ReferenceType instance pointing to the decorator function.
   */
  type?: TypeObject;

  /**
   * A named map of arguments the decorator is applied with.
   */
  arguments?: any;
}

export interface ProjectReflectionObject extends ContainerReflectionObject { }

export interface SourceReferenceObject {
  fileName: string;
  line: number;
  character: number;
}

export interface TypeObject {

  /**
   * The type name identifier.
   */
  type: 'void' | 'array' | 'intersection' | 'intrinsic' | 'reference' | 'reflection' | 'stringLiteral' | 'tuple' | 'typeParameter' | 'union' | 'unknown' | string;

  // array
  /**
   * For Array type only, The type (T) of the array's elements.
   */
  elementType?: TypeObject;

  // intersection
  /**
   * For intersection type only, the types the union consists of.
   * For union type only, the types the union consists of.
   */
  types?: TypeObject[];

  // intrinsic, reference, typeParameter, unknown
  /**
   * For intrinsic type only, The name of the intrinsic type like `string` or `boolean`.
   *
   * For reference type only,  The name of the referenced type.
   * If the symbol cannot be found cause it's not part of the documentation this
   * can be used to represent the type.
   *
   * For typeParameter type only, the name of the type.
   *
   * For unknown type only, the name of the type.
   */
  name?: 'Object' | 'string' | 'number' | 'boolean' | 'this' | string;

  // reference
  /**
   * The reflection id for this type
   */
  id?: number;

  /**
   * For reference type only, The type arguments of this reference.
   */
  typeArguments?: TypeObject[];

  // reflection
  /**
   * For reflection type only, The reflection of the type.
   */
  declaration?: ReflectionObject;

  // stringLiteral
  /**
   * For stringLiteral type only, The string literal value.
   */
  value?: string;

  // tuple
  /**
   * For tuple type only, The ordered type elements of the tuple type.
   */
  elements?: TypeObject[];

  // typeParameter
  /**
   * For typeParameter type only, The constraint type for the generic type.
   */
  constraint?: TypeObject;
}

export interface ReflectionGroupObject {
  /**
   * The title, a string representation of the typescript kind, of this group.
   */
  title: string;

  /**
   * The original typescript kind of the children of this group.
   */
  kind: number;

  /**
   * A list of reflection id's for this group.
   */
  children?: number[];

  /**
   * A list of categories for this group.
   */
  categories?: ReflectionCategoryObject[];
}

export interface ReflectionCategoryObject {
  /**
   * The title, a string representation of the typescript kind, of this category.
   */
  title: string;

  /**
   * A list of reflection id's for this category.
   */
  children?: number[];
}

export interface ReflectionFlagsObject {
  /**
   * Is this a private member?
   */
  isPrivate?: boolean;

  /**
   * Is this a protected member?
   */
  isProtected?: boolean;

  /**
   * Is this a public member?
   */
  isPublic?: boolean;

  /**
   * Is this a static member?
   */
  isStatic?: boolean;

  /**
   * Is this member exported?
   */
  isExported?: boolean;

  /**
   * Is this a declaration from an external document?
   */
  isExternal?: boolean;

  /**
   * Whether this reflection is an optional component or not.
   *
   * Applies to function parameters and object members.
   */
  isOptional?: boolean;

  /**
   * Whether it's a rest parameter, like `foo(...params);`.
   */
  isRest?: boolean;

  /**
   *
   */
  hasExportAssignment?: boolean;

  isConstructorProperty?: boolean;
}
