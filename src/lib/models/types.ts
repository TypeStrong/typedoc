import type * as ts from "typescript";
import type { Context } from "../converter";
import { Reflection } from "./reflections/abstract";
import type { DeclarationReflection } from "./reflections/declaration";
import type { ProjectReflection } from "./reflections/project";
import type { Serializer, JSONOutput } from "../serialization";
import { getQualifiedName } from "../utils/tsutils";
import type { DeclarationReference } from "../converter/comments/declarationReference";

/**
 * Base class of all type definitions.
 */
export abstract class Type {
    /**
     * The type name identifier.
     */
    abstract readonly type: keyof TypeKindMap;

    /**
     * Return a string representation of this type.
     */
    toString(): string {
        return this.stringify(TypeContext.none);
    }

    /**
     * Visit this type, returning the value returned by the visitor.
     */
    visit<T>(visitor: TypeVisitor<T>): T;
    visit<T>(visitor: Partial<TypeVisitor<T>>): T | undefined;
    visit(visitor: Partial<TypeVisitor<unknown>>): unknown {
        return visitor[this.type]?.(this as never);
    }

    stringify(context: TypeContext) {
        if (this.needsParenthesis(context)) {
            return `(${this.getTypeString()})`;
        }
        return this.getTypeString();
    }

    abstract toObject(serializer: Serializer): JSONOutput.SomeType;

    abstract needsParenthesis(context: TypeContext): boolean;

    /**
     * Implementation method for `toString`. `needsParenthesis` will be used to determine if
     * the returned string should be wrapped in parenthesis.
     */
    protected abstract getTypeString(): string;
}

export interface TypeKindMap {
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
    "named-tuple-member": NamedTupleMember;
    typeOperator: TypeOperatorType;
    union: UnionType;
    unknown: UnknownType;
}

export type TypeVisitor<T = void> = {
    [K in TypeKind]: (type: TypeKindMap[K]) => T;
};

export function makeRecursiveVisitor(
    visitor: Partial<TypeVisitor>
): TypeVisitor {
    const recursiveVisitor: TypeVisitor = {
        "named-tuple-member"(type) {
            visitor["named-tuple-member"]?.(type);
            type.element.visit(recursiveVisitor);
        },
        "template-literal"(type) {
            visitor["template-literal"]?.(type);
            for (const [h] of type.tail) {
                h.visit(recursiveVisitor);
            }
        },
        array(type) {
            visitor.array?.(type);
            type.elementType.visit(recursiveVisitor);
        },
        conditional(type) {
            visitor.conditional?.(type);
            type.checkType.visit(recursiveVisitor);
            type.extendsType.visit(recursiveVisitor);
            type.trueType.visit(recursiveVisitor);
            type.falseType.visit(recursiveVisitor);
        },
        indexedAccess(type) {
            visitor.indexedAccess?.(type);
            type.indexType.visit(recursiveVisitor);
            type.objectType.visit(recursiveVisitor);
        },
        inferred(type) {
            visitor.inferred?.(type);
            type.constraint?.visit(recursiveVisitor);
        },
        intersection(type) {
            visitor.intersection?.(type);
            type.types.forEach((t) => t.visit(recursiveVisitor));
        },
        intrinsic(type) {
            visitor.intrinsic?.(type);
        },
        literal(type) {
            visitor.literal?.(type);
        },
        mapped(type) {
            visitor.mapped?.(type);
            type.nameType?.visit(recursiveVisitor);
            type.parameterType.visit(recursiveVisitor);
            type.templateType.visit(recursiveVisitor);
        },
        optional(type) {
            visitor.optional?.(type);
            type.elementType.visit(recursiveVisitor);
        },
        predicate(type) {
            visitor.predicate?.(type);
            type.targetType?.visit(recursiveVisitor);
        },
        query(type) {
            visitor.query?.(type);
            type.queryType.visit(recursiveVisitor);
        },
        reference(type) {
            visitor.reference?.(type);
            type.typeArguments?.forEach((t) => t.visit(recursiveVisitor));
        },
        reflection(type) {
            visitor.reflection?.(type);
            // Future: This should maybe recurse too?
            // See the validator in exports.ts for how to do it.
        },
        rest(type) {
            visitor.rest?.(type);
            type.elementType.visit(recursiveVisitor);
        },
        tuple(type) {
            visitor.tuple?.(type);
            type.elements.forEach((t) => t.visit(recursiveVisitor));
        },
        typeOperator(type) {
            visitor.typeOperator?.(type);
            type.target.visit(recursiveVisitor);
        },
        union(type) {
            visitor.union?.(type);
            type.types.forEach((t) => t.visit(recursiveVisitor));
        },
        unknown(type) {
            visitor.unknown?.(type);
        },
    };
    return recursiveVisitor;
}

export type TypeKind = keyof TypeKindMap;

export type SomeType = TypeKindMap[keyof TypeKindMap];

/**
 * Enumeration that can be used when traversing types to track the location of recursion.
 * Used by TypeDoc internally to track when to output parenthesis when rendering.
 * @enum
 */
export const TypeContext = {
    none: "none",
    templateLiteralElement: "templateLiteralElement", // `${here}`
    arrayElement: "arrayElement", // here[]
    indexedAccessElement: "indexedAccessElement", // {}[here]
    conditionalCheck: "conditionalCheck", // here extends 1 ? 2 : 3
    conditionalExtends: "conditionalExtends", // 1 extends here ? 2 : 3
    conditionalTrue: "conditionalTrue", // 1 extends 2 ? here : 3
    conditionalFalse: "conditionalFalse", // 1 extends 2 ? 3 : here
    indexedIndex: "indexedIndex", // {}[here]
    indexedObject: "indexedObject", // here[1]
    inferredConstraint: "inferredConstraint", // 1 extends infer X extends here ? 1 : 2
    intersectionElement: "intersectionElement", // here & 1
    mappedName: "mappedName", // { [k in string as here]: 1 }
    mappedParameter: "mappedParameter", // { [k in here]: 1 }
    mappedTemplate: "mappedTemplate", // { [k in string]: here }
    optionalElement: "optionalElement", // [here?]
    predicateTarget: "predicateTarget", // (): X is here
    queryTypeTarget: "queryTypeTarget", // typeof here, can only ever be a ReferenceType
    typeOperatorTarget: "typeOperatorTarget", // keyof here
    referenceTypeArgument: "referenceTypeArgument", // X<here>
    restElement: "restElement", // [...here]
    tupleElement: "tupleElement", // [here]
    unionElement: "unionElement", // here | 1
} as const;
export type TypeContext = typeof TypeContext[keyof typeof TypeContext];

/**
 * Represents an array type.
 *
 * ```ts
 * let value: string[];
 * ```
 */
export class ArrayType extends Type {
    override readonly type = "array";

    /**
     * @param elementType The type of the elements in the array.
     */
    constructor(public elementType: SomeType) {
        super();
    }

    protected override getTypeString() {
        return this.elementType.stringify(TypeContext.arrayElement) + "[]";
    }

    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(serializer: Serializer): JSONOutput.ArrayType {
        return {
            type: this.type,
            elementType: serializer.toObject(this.elementType),
        };
    }
}

/**
 * Represents a conditional type.
 *
 * ```ts
 * let value: Check extends Extends ? True : False;
 * ```
 */
export class ConditionalType extends Type {
    override readonly type = "conditional";

    constructor(
        public checkType: SomeType,
        public extendsType: SomeType,
        public trueType: SomeType,
        public falseType: SomeType
    ) {
        super();
    }

    protected override getTypeString() {
        return [
            this.checkType.stringify(TypeContext.conditionalCheck),
            "extends",
            this.extendsType.stringify(TypeContext.conditionalExtends),
            "?",
            this.trueType.stringify(TypeContext.conditionalTrue),
            ":",
            this.falseType.stringify(TypeContext.conditionalFalse),
        ].join(" ");
    }

    override needsParenthesis(context: TypeContext): boolean {
        const map: Record<TypeContext, boolean> = {
            none: false,
            templateLiteralElement: false,
            arrayElement: true,
            indexedAccessElement: false,
            conditionalCheck: true,
            conditionalExtends: true,
            conditionalTrue: false,
            conditionalFalse: false,
            indexedIndex: false,
            indexedObject: true,
            inferredConstraint: true,
            intersectionElement: true,
            mappedName: false,
            mappedParameter: false,
            mappedTemplate: false,
            optionalElement: true,
            predicateTarget: false,
            queryTypeTarget: false,
            typeOperatorTarget: true,
            referenceTypeArgument: false,
            restElement: true,
            tupleElement: false,
            unionElement: true,
        };

        return map[context];
    }

    override toObject(serializer: Serializer): JSONOutput.ConditionalType {
        return {
            type: this.type,
            checkType: serializer.toObject(this.checkType),
            extendsType: serializer.toObject(this.extendsType),
            trueType: serializer.toObject(this.trueType),
            falseType: serializer.toObject(this.falseType),
        };
    }
}

/**
 * Represents an indexed access type.
 */
export class IndexedAccessType extends Type {
    override readonly type = "indexedAccess";

    constructor(public objectType: SomeType, public indexType: SomeType) {
        super();
    }

    protected override getTypeString() {
        return [
            this.objectType.stringify(TypeContext.indexedObject),
            "[",
            this.indexType.stringify(TypeContext.indexedIndex),
            "]",
        ].join("");
    }

    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(serializer: Serializer): JSONOutput.IndexedAccessType {
        return {
            type: this.type,
            indexType: serializer.toObject(this.indexType),
            objectType: serializer.toObject(this.objectType),
        };
    }
}

/**
 * Represents an inferred type, U in the example below.
 *
 * ```ts
 * type Z = Promise<string> extends Promise<infer U> : never
 * ```
 */
export class InferredType extends Type {
    override readonly type = "inferred";

    constructor(public name: string, public constraint?: SomeType) {
        super();
    }

    protected override getTypeString() {
        if (this.constraint) {
            return `infer ${this.name} extends ${this.constraint.stringify(
                TypeContext.inferredConstraint
            )}`;
        }
        return `infer ${this.name}`;
    }

    override needsParenthesis(context: TypeContext): boolean {
        const map: Record<TypeContext, boolean> = {
            none: false,
            templateLiteralElement: false,
            arrayElement: true,
            indexedAccessElement: false,
            conditionalCheck: false,
            conditionalExtends: false,
            conditionalTrue: false,
            conditionalFalse: false,
            indexedIndex: false,
            indexedObject: true,
            inferredConstraint: false,
            intersectionElement: false,
            mappedName: false,
            mappedParameter: false,
            mappedTemplate: false,
            optionalElement: true,
            predicateTarget: false,
            queryTypeTarget: false,
            typeOperatorTarget: false,
            referenceTypeArgument: false,
            restElement: true,
            tupleElement: false,
            unionElement: false,
        };

        return map[context];
    }

    override toObject(serializer: Serializer): JSONOutput.InferredType {
        return {
            type: this.type,
            name: this.name,
            constraint: serializer.toObject(this.constraint),
        };
    }
}

/**
 * Represents an intersection type.
 *
 * ```ts
 * let value: A & B;
 * ```
 */
export class IntersectionType extends Type {
    override readonly type = "intersection";

    constructor(public types: SomeType[]) {
        super();
    }

    protected override getTypeString() {
        return this.types
            .map((t) => t.stringify(TypeContext.intersectionElement))
            .join(" & ");
    }

    override needsParenthesis(context: TypeContext): boolean {
        const map: Record<TypeContext, boolean> = {
            none: false,
            templateLiteralElement: false,
            arrayElement: true,
            indexedAccessElement: false,
            conditionalCheck: true,
            conditionalExtends: false,
            conditionalTrue: false,
            conditionalFalse: false,
            indexedIndex: false,
            indexedObject: true,
            inferredConstraint: false,
            intersectionElement: false,
            mappedName: false,
            mappedParameter: false,
            mappedTemplate: false,
            optionalElement: true,
            predicateTarget: false,
            queryTypeTarget: false,
            typeOperatorTarget: true,
            referenceTypeArgument: false,
            restElement: true,
            tupleElement: false,
            unionElement: false,
        };

        return map[context];
    }

    override toObject(serializer: Serializer): JSONOutput.IntersectionType {
        return {
            type: this.type,
            types: this.types.map((t) => serializer.toObject(t)),
        };
    }
}

/**
 * Represents an intrinsic type like `string` or `boolean`.
 *
 * ```ts
 * let value: number;
 * ```
 */
export class IntrinsicType extends Type {
    override readonly type = "intrinsic";

    constructor(public name: string) {
        super();
    }

    protected override getTypeString() {
        return this.name;
    }

    override toObject(): JSONOutput.IntrinsicType {
        return {
            type: this.type,
            name: this.name,
        };
    }

    override needsParenthesis(): boolean {
        return false;
    }
}

/**
 * Represents a literal type.
 *
 * ```ts
 * type A = "A"
 * type B = 1
 * ```
 */
export class LiteralType extends Type {
    override readonly type = "literal";

    constructor(public value: string | number | boolean | null | bigint) {
        super();
    }

    /**
     * Return a string representation of this type.
     */
    protected override getTypeString(): string {
        if (typeof this.value === "bigint") {
            return this.value.toString() + "n";
        }
        return JSON.stringify(this.value);
    }

    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(): JSONOutput.LiteralType {
        if (typeof this.value === "bigint") {
            return {
                type: this.type,
                value: {
                    value: this.value.toString().replace("-", ""),
                    negative: this.value < BigInt("0"),
                },
            };
        }

        return {
            type: this.type,
            value: this.value,
        };
    }
}

/**
 * Represents a mapped type.
 *
 * ```ts
 * { -readonly [K in Parameter as Name]?: Template }
 * ```
 */
export class MappedType extends Type {
    override readonly type = "mapped";

    constructor(
        public parameter: string,
        public parameterType: SomeType,
        public templateType: SomeType,
        public readonlyModifier?: "+" | "-",
        public optionalModifier?: "+" | "-",
        public nameType?: SomeType
    ) {
        super();
    }

    protected override getTypeString(): string {
        const read = {
            "+": "readonly ",
            "-": "-readonly ",
            "": "",
        }[this.readonlyModifier ?? ""];

        const opt = {
            "+": "?",
            "-": "-?",
            "": "",
        }[this.optionalModifier ?? ""];

        const parts = [
            "{ ",
            read,
            "[",
            this.parameter,
            " in ",
            this.parameterType.stringify(TypeContext.mappedParameter),
        ];

        if (this.nameType) {
            parts.push(" as ", this.nameType.stringify(TypeContext.mappedName));
        }

        parts.push(
            "]",
            opt,
            ": ",
            this.templateType.stringify(TypeContext.mappedTemplate),
            " }"
        );
        return parts.join("");
    }

    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(serializer: Serializer): JSONOutput.MappedType {
        return {
            type: this.type,
            parameter: this.parameter,
            parameterType: serializer.toObject(this.parameterType),
            templateType: serializer.toObject(this.templateType),
            readonlyModifier: this.readonlyModifier,
            optionalModifier: this.optionalModifier,
            nameType: serializer.toObject(this.nameType),
        };
    }
}

/**
 * Represents an optional type
 * ```ts
 * type Z = [1, 2?]
 * //           ^^
 * ```
 */
export class OptionalType extends Type {
    override readonly type = "optional";

    elementType: SomeType;

    constructor(elementType: SomeType) {
        super();
        this.elementType = elementType;
    }

    protected override getTypeString() {
        return this.elementType.stringify(TypeContext.optionalElement) + "?";
    }

    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(serializer: Serializer): JSONOutput.OptionalType {
        return {
            type: this.type,
            elementType: serializer.toObject(this.elementType),
        };
    }
}

/**
 * Represents a type predicate.
 *
 * ```ts
 * function isString(x: unknown): x is string {}
 * function assert(condition: boolean): asserts condition {}
 * ```
 */
export class PredicateType extends Type {
    override readonly type = "predicate";

    /**
     * Create a new PredicateType instance.
     *
     * @param name The identifier name which is tested by the predicate.
     * @param asserts True if the type is of the form `asserts val is string`,
     *                false if the type is of the form `val is string`
     * @param targetType The type that the identifier is tested to be.
     *                   May be undefined if the type is of the form `asserts val`.
     *                   Will be defined if the type is of the form `asserts val is string` or `val is string`.
     */
    constructor(
        public name: string,
        public asserts: boolean,
        public targetType?: SomeType
    ) {
        super();
    }

    /**
     * Return a string representation of this type.
     */
    protected override getTypeString() {
        const out = this.asserts ? ["asserts", this.name] : [this.name];
        if (this.targetType) {
            out.push(
                "is",
                this.targetType.stringify(TypeContext.predicateTarget)
            );
        }

        return out.join(" ");
    }

    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(serializer: Serializer): JSONOutput.PredicateType {
        return {
            type: this.type,
            name: this.name,
            asserts: this.asserts,
            targetType: serializer.toObject(this.targetType),
        };
    }
}

/**
 * Represents a type that is constructed by querying the type of a reflection.
 * ```ts
 * const x = 1
 * type Z = typeof x // query on reflection for x
 * ```
 */
export class QueryType extends Type {
    readonly queryType: ReferenceType;

    override readonly type = "query";

    constructor(reference: ReferenceType) {
        super();
        this.queryType = reference;
    }

    protected override getTypeString() {
        return `typeof ${this.queryType.stringify(
            TypeContext.queryTypeTarget
        )}`;
    }

    /**
     * @privateRemarks
     * An argument could be made that this ought to return true for indexedObject
     * since precedence is different than on the value side... if someone really cares
     * they can easily use a custom theme to change this.
     */
    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(serializer: Serializer): JSONOutput.QueryType {
        return {
            type: this.type,
            queryType: serializer.toObject(this.queryType),
        };
    }
}

/**
 * Represents a type that refers to another reflection like a class, interface or enum.
 *
 * ```ts
 * let value: MyClass<T>;
 * ```
 */
export class ReferenceType extends Type {
    override readonly type = "reference";

    /**
     * The name of the referenced type.
     *
     * If the symbol cannot be found cause it's not part of the documentation this
     * can be used to represent the type.
     */
    name: string;

    /**
     * The type arguments of this reference.
     */
    typeArguments?: SomeType[];

    /**
     * The resolved reflection.
     */
    get reflection() {
        if (typeof this._target === "number") {
            return this._project?.getReflectionById(this._target);
        }
        const resolved = this._project?.getReflectionFromSymbol(this._target);
        if (resolved) this._target = resolved.id;
        return resolved;
    }

    /**
     * Don't use this if at all possible. It will eventually go away since models may not
     * retain information from the original TS objects to enable documentation generation from
     * previously generated JSON.
     * @internal
     */
    getSymbol(): ts.Symbol | undefined {
        if (typeof this._target === "number") {
            return;
        }
        return this._target;
    }

    /**
     * Convert this reference type to a declaration reference used for resolution of external types.
     */
    toDeclarationReference(): DeclarationReference {
        return {
            resolutionStart: "global",
            moduleSource: this.package,
            symbolReference: {
                path: this.qualifiedName
                    .split(".")
                    .map((p) => ({ path: p, navigation: "." })),
            },
        };
    }

    /**
     * The fully qualified name of the referenced type, relative to the file it is defined in.
     * This will usually be the same as `name`, unless namespaces are used.
     */
    qualifiedName: string;

    /**
     * The package that this type is referencing.
     * Will only be set for `ReferenceType`s pointing to a symbol within `node_modules`.
     */
    package?: string;

    /**
     * If this reference type refers to a reflection defined by a project not being rendered,
     * points to the url that this type should be linked to.
     */
    externalUrl?: string;

    private _target: ts.Symbol | number;
    private _project: ProjectReflection;

    private constructor(
        name: string,
        target: ts.Symbol | Reflection | number,
        project: ProjectReflection,
        qualifiedName: string
    ) {
        super();
        this.name = name;
        this._target = target instanceof Reflection ? target.id : target;
        this._project = project;
        this.qualifiedName = qualifiedName;
    }

    static createResolvedReference(
        name: string,
        target: Reflection | number,
        project: ProjectReflection
    ) {
        return new ReferenceType(name, target, project, name);
    }

    static createSymbolReference(
        symbol: ts.Symbol,
        context: Context,
        name?: string
    ) {
        const ref = new ReferenceType(
            name ?? symbol.name,
            symbol,
            context.project,
            getQualifiedName(context.checker, symbol)
        );

        const symbolPath = symbol?.declarations?.[0]
            ?.getSourceFile()
            .fileName.replace(/\\/g, "/");
        if (!symbolPath) return ref;

        let startIndex = symbolPath.lastIndexOf("node_modules/");
        if (startIndex === -1) return ref;
        startIndex += "node_modules/".length;
        let stopIndex = symbolPath.indexOf("/", startIndex);
        // Scoped package, e.g. `@types/node`
        if (symbolPath[startIndex] === "@") {
            stopIndex = symbolPath.indexOf("/", stopIndex + 1);
        }

        const packageName = symbolPath.substring(startIndex, stopIndex);
        ref.package = packageName;

        return ref;
    }

    /** @internal this is used for type parameters, which don't actually point to something */
    static createBrokenReference(name: string, project: ProjectReflection) {
        return new ReferenceType(name, -1, project, name);
    }

    protected override getTypeString() {
        const name = this.reflection ? this.reflection.name : this.name;
        let typeArgs = "";

        if (this.typeArguments && this.typeArguments.length > 0) {
            typeArgs += "<";
            typeArgs += this.typeArguments
                .map((arg) => arg.stringify(TypeContext.referenceTypeArgument))
                .join(", ");
            typeArgs += ">";
        }

        return name + typeArgs;
    }

    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(serializer: Serializer): JSONOutput.ReferenceType {
        const result: JSONOutput.ReferenceType = {
            type: this.type,
            id: this.reflection?.id,
            typeArguments: serializer.toObjectsOptional(this.typeArguments),
            name: this.name,
            externalUrl: this.externalUrl,
        };

        if (this.package) {
            result.qualifiedName = this.qualifiedName;
            result.package = this.package;
        }

        return result;
    }
}

/**
 * Represents a type which has it's own reflection like literal types.
 * This type will likely go away at some point and be replaced by a dedicated
 * `ObjectType`. Allowing reflections to be nested within types causes much
 * pain in the rendering code.
 *
 * ```ts
 * let value: { a: string, b: number };
 * ```
 */
export class ReflectionType extends Type {
    override readonly type = "reflection";

    declaration: DeclarationReflection;

    constructor(declaration: DeclarationReflection) {
        super();
        this.declaration = declaration;
    }

    // This really ought to do better, but I'm putting off investing effort here until
    // I'm fully convinced that keeping this is a good idea. Currently, I'd much rather
    // change object types to not create reflections.
    protected override getTypeString() {
        if (!this.declaration.children && this.declaration.signatures) {
            return "Function";
        } else {
            return "Object";
        }
    }

    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(serializer: Serializer): JSONOutput.ReflectionType {
        return {
            type: this.type,
            declaration: serializer.toObject(this.declaration),
        };
    }
}

/**
 * Represents a rest type
 * ```ts
 * type Z = [1, ...2[]]
 * //           ^^^^^^
 * ```
 */
export class RestType extends Type {
    override readonly type = "rest";

    constructor(public elementType: SomeType) {
        super();
    }

    protected override getTypeString() {
        return `...${this.elementType.stringify(TypeContext.restElement)}`;
    }

    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(serializer: Serializer): JSONOutput.RestType {
        return {
            type: this.type,
            elementType: serializer.toObject(this.elementType),
        };
    }
}

/**
 * TS 4.1 template literal types
 * ```ts
 * type Z = `${'a' | 'b'}${'a' | 'b'}`
 * ```
 */
export class TemplateLiteralType extends Type {
    override readonly type = "template-literal";

    constructor(public head: string, public tail: [SomeType, string][]) {
        super();
    }

    protected override getTypeString() {
        return [
            "`",
            this.head,
            ...this.tail.map(([type, text]) => {
                return (
                    "${" +
                    type.stringify(TypeContext.templateLiteralElement) +
                    "}" +
                    text
                );
            }),
            "`",
        ].join("");
    }

    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(serializer: Serializer): JSONOutput.TemplateLiteralType {
        return {
            type: this.type,
            head: this.head,
            tail: this.tail.map(([type, text]) => [
                serializer.toObject(type),
                text,
            ]),
        };
    }
}

/**
 * Represents a tuple type.
 *
 * ```ts
 * let value: [string, boolean];
 * ```
 */
export class TupleType extends Type {
    override readonly type = "tuple";

    /**
     * @param elements The ordered type elements of the tuple type.
     */
    constructor(public elements: SomeType[]) {
        super();
    }

    protected override getTypeString() {
        return (
            "[" +
            this.elements
                .map((t) => t.stringify(TypeContext.tupleElement))
                .join(", ") +
            "]"
        );
    }

    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(serializer: Serializer): JSONOutput.TupleType {
        return {
            type: this.type,
            elements: serializer.toObjectsOptional(this.elements),
        };
    }
}

/**
 * Represents a named member of a tuple type.
 *
 * ```ts
 * let value: [name: string];
 * ```
 */
export class NamedTupleMember extends Type {
    override readonly type = "named-tuple-member";

    constructor(
        public name: string,
        public isOptional: boolean,
        public element: SomeType
    ) {
        super();
    }

    /**
     * Return a string representation of this type.
     */
    protected override getTypeString() {
        return `${this.name}${
            this.isOptional ? "?" : ""
        }: ${this.element.stringify(TypeContext.tupleElement)}`;
    }

    override needsParenthesis(): boolean {
        return false;
    }

    override toObject(serializer: Serializer): JSONOutput.NamedTupleMemberType {
        return {
            type: this.type,
            name: this.name,
            isOptional: this.isOptional,
            element: serializer.toObject(this.element),
        };
    }
}

/**
 * Represents a type operator type.
 *
 * ```ts
 * class A {}
 * class B<T extends keyof A> {}
 * ```
 */
export class TypeOperatorType extends Type {
    override readonly type = "typeOperator";

    constructor(
        public target: SomeType,
        public operator: "keyof" | "unique" | "readonly"
    ) {
        super();
    }

    protected override getTypeString() {
        return `${this.operator} ${this.target.stringify(
            TypeContext.typeOperatorTarget
        )}`;
    }

    override needsParenthesis(context: TypeContext): boolean {
        const map: Record<TypeContext, boolean> = {
            none: false,
            templateLiteralElement: false,
            arrayElement: true,
            indexedAccessElement: false,
            conditionalCheck: false,
            conditionalExtends: false,
            conditionalTrue: false,
            conditionalFalse: false,
            indexedIndex: false,
            indexedObject: true,
            inferredConstraint: false,
            intersectionElement: false,
            mappedName: false,
            mappedParameter: false,
            mappedTemplate: false,
            optionalElement: true,
            predicateTarget: false,
            queryTypeTarget: false,
            typeOperatorTarget: false,
            referenceTypeArgument: false,
            restElement: false,
            tupleElement: false,
            unionElement: false,
        };

        return map[context];
    }

    override toObject(serializer: Serializer): JSONOutput.TypeOperatorType {
        return {
            type: this.type,
            operator: this.operator,
            target: serializer.toObject(this.target),
        };
    }
}

/**
 * Represents an union type.
 *
 * ```ts
 * let value: string | string[];
 * ```
 */
export class UnionType extends Type {
    override readonly type = "union";

    constructor(public types: SomeType[]) {
        super();
        this.normalize();
    }

    protected override getTypeString(): string {
        return this.types
            .map((t) => t.stringify(TypeContext.unionElement))
            .join(" | ");
    }

    override needsParenthesis(context: TypeContext): boolean {
        const map: Record<TypeContext, boolean> = {
            none: false,
            templateLiteralElement: false,
            arrayElement: true,
            indexedAccessElement: false,
            conditionalCheck: true,
            conditionalExtends: false,
            conditionalTrue: false,
            conditionalFalse: false,
            indexedIndex: false,
            indexedObject: true,
            inferredConstraint: false,
            intersectionElement: true,
            mappedName: false,
            mappedParameter: false,
            mappedTemplate: false,
            optionalElement: true,
            predicateTarget: false,
            queryTypeTarget: false,
            typeOperatorTarget: true,
            referenceTypeArgument: false,
            restElement: false,
            tupleElement: false,
            unionElement: false,
        };

        return map[context];
    }

    private normalize() {
        let trueIndex = -1;
        let falseIndex = -1;
        for (
            let i = 0;
            i < this.types.length && (trueIndex === -1 || falseIndex === -1);
            i++
        ) {
            const t = this.types[i];
            if (t instanceof LiteralType) {
                if (t.value === true) {
                    trueIndex = i;
                }
                if (t.value === false) {
                    falseIndex = i;
                }
            }
        }

        if (trueIndex !== -1 && falseIndex !== -1) {
            this.types.splice(Math.max(trueIndex, falseIndex), 1);
            this.types.splice(
                Math.min(trueIndex, falseIndex),
                1,
                new IntrinsicType("boolean")
            );
        }
    }

    override toObject(serializer: Serializer): JSONOutput.UnionType {
        return {
            type: this.type,
            types: this.types.map((t) => serializer.toObject(t)),
        };
    }
}

/**
 * Represents all unknown types that cannot be converted by TypeDoc.
 */
export class UnknownType extends Type {
    override readonly type = "unknown";

    /**
     * A string representation of the type as returned from TypeScript compiler.
     */
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    protected override getTypeString() {
        return this.name;
    }

    /**
     * Always returns true if not at the root level, we have no idea what's in here, so wrap it in parenthesis
     * to be extra safe.
     */
    override needsParenthesis(context: TypeContext): boolean {
        return context !== TypeContext.none;
    }

    override toObject(): JSONOutput.UnknownType {
        return {
            type: this.type,
            name: this.name,
        };
    }
}
