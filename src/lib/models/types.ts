import type * as ts from "typescript";
import type { Context } from "../converter";
import { Reflection } from "./reflections/abstract";
import type { DeclarationReflection } from "./reflections/declaration";
import type { ProjectReflection } from "./reflections/project";
import type { Serializer, JSONOutput } from "../serialization";

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
    abstract toString(): string;

    /**
     * Visit this type, returning the value returned by the visitor.
     */
    visit<T>(visitor: TypeVisitor<T>): T {
        return visitor[this.type](this as never);
    }

    abstract toObject(serializer: Serializer): JSONOutput.Type;
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
        },
        intersection(type) {
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

// A lower binding power means that if contained within a type
// with a higher binding power the type must be parenthesized.
// 999 = never have parenthesis
// -1 = always have parenthesis
const BINDING_POWERS = {
    array: 999,
    conditional: 70,
    conditionalCheckType: 150,
    indexedAccess: 999,
    inferred: 999,
    intersection: 120,
    intrinsic: 999,
    literal: 999,
    mapped: 999,
    optional: 999,
    predicate: 999,
    query: 900,
    reference: 999,
    reflection: 999,
    rest: 999,
    "template-literal": 999,
    tuple: 999,
    "named-tuple-member": 999,
    typeOperator: 900,
    union: 100,
    // We should always wrap these in parenthesis since we don't know what they contain.
    unknown: -1,
};

function wrap(type: Type, bp: number) {
    if (BINDING_POWERS[type.type] < bp) {
        return `(${type})`;
    }
    return type.toString();
}

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

    override toString(): string {
        return wrap(this.elementType, BINDING_POWERS.array) + "[]";
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

    override toString(): string {
        return [
            wrap(this.checkType, BINDING_POWERS.conditionalCheckType),
            "extends",
            this.extendsType, // no need to wrap
            "?",
            this.trueType, // no need to wrap
            ":",
            this.falseType, // no need to wrap
        ].join(" ");
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

    override toString() {
        return `${this.objectType}[${this.indexType}]`;
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

    constructor(public name: string) {
        super();
    }

    override toString() {
        return `infer ${this.name}`;
    }

    override toObject(): JSONOutput.InferredType {
        return {
            type: this.type,
            name: this.name,
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

    override toString(): string {
        return this.types
            .map((t) => wrap(t, BINDING_POWERS.intersection))
            .join(" & ");
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

    override toString() {
        return this.name;
    }

    override toObject(): JSONOutput.IntrinsicType {
        return {
            type: this.type,
            name: this.name,
        };
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
    override toString(): string {
        if (typeof this.value === "bigint") {
            return this.value.toString() + "n";
        }
        return JSON.stringify(this.value);
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
 * { -readonly [K in keyof U & string as `a${K}`]?: Foo }
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

    override toString(): string {
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

        const name = this.nameType ? ` as ${this.nameType}` : "";

        return `{ ${read}[${this.parameter} in ${this.parameterType}${name}]${opt}: ${this.templateType} }`;
    }

    override toObject(serializer: Serializer): JSONOutput.MappedType {
        return {
            type: this.type,
            parameter: this.parameter,
            parameterType: serializer.toObject(this.parameterType),
            templateType: serializer.toObject(this.templateType),
            readonlyModifier: this.readonlyModifier,
            optionalModifier: this.optionalModifier,
            nameType: this.nameType && serializer.toObject(this.nameType),
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

    override toString() {
        return wrap(this.elementType, BINDING_POWERS.optional) + "?";
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
 * function isString(anything: any): anything is string {}
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
    override toString() {
        const out = this.asserts ? ["asserts", this.name] : [this.name];
        if (this.targetType) {
            out.push("is", this.targetType.toString());
        }

        return out.join(" ");
    }

    override toObject(serializer: Serializer): JSONOutput.PredicateType {
        return {
            type: this.type,
            name: this.name,
            asserts: this.asserts,
            targetType: this.targetType && serializer.toObject(this.targetType),
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

    override toString() {
        return `typeof ${this.queryType.toString()}`;
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
     * The fully qualified name of the referenced type, relative to the file it is defined in.
     * This will usually be the same as `name`, unless namespaces are used.
     * Will only be set for `ReferenceType`s pointing to a symbol within `node_modules`.
     */
    qualifiedName?: string;

    /**
     * The package that this type is referencing.
     * Will only be set for `ReferenceType`s pointing to a symbol within `node_modules`.
     */
    package?: string;

    private _target: ts.Symbol | number;
    private _project: ProjectReflection | null;

    private constructor(
        name: string,
        target: ts.Symbol | Reflection | number,
        project: ProjectReflection | null
    ) {
        super();
        this.name = name;
        this._target = target instanceof Reflection ? target.id : target;
        this._project = project;
    }

    static createResolvedReference(
        name: string,
        target: Reflection | number,
        project: ProjectReflection | null
    ) {
        return new ReferenceType(name, target, project);
    }

    static createSymbolReference(
        symbol: ts.Symbol,
        context: Context,
        name?: string
    ) {
        const ref = new ReferenceType(
            name ?? symbol.name,
            symbol,
            context.project
        );

        const symbolPath = symbol?.declarations?.[0]
            ?.getSourceFile()
            .fileName.replace(/\\/g, "/");
        if (!symbolPath) return ref;

        let startIndex = symbolPath.indexOf("node_modules/");
        if (startIndex === -1) return ref;
        startIndex += "node_modules/".length;
        let stopIndex = symbolPath.indexOf("/", startIndex);
        // Scoped package, e.g. `@types/node`
        if (symbolPath[startIndex] === "@") {
            stopIndex = symbolPath.indexOf("/", stopIndex + 1);
        }

        const packageName = symbolPath.substring(startIndex, stopIndex);
        ref.package = packageName;

        const qualifiedName = context.checker.getFullyQualifiedName(symbol);
        // I think this is less bad than depending on symbol.parent...
        // https://github.com/microsoft/TypeScript/issues/38344
        // It will break if someone names a directory with a quote in it, but so will lots
        // of other things including other parts of TypeDoc. Until it *actually* breaks someone...
        if (qualifiedName.startsWith('"')) {
            ref.qualifiedName = qualifiedName.substring(
                qualifiedName.indexOf('".', 1) + 2
            );
        } else {
            ref.qualifiedName = qualifiedName;
        }

        return ref;
    }

    /** @internal this is used for type parameters, which don't actually point to something */
    static createBrokenReference(name: string, project: ProjectReflection) {
        return new ReferenceType(name, -1, project);
    }

    override toString() {
        const name = this.reflection ? this.reflection.name : this.name;
        let typeArgs = "";

        if (this.typeArguments && this.typeArguments.length > 0) {
            typeArgs += "<";
            typeArgs += this.typeArguments
                .map((arg) => arg.toString())
                .join(", ");
            typeArgs += ">";
        }

        return name + typeArgs;
    }

    override toObject(serializer: Serializer): JSONOutput.ReferenceType {
        const result: JSONOutput.ReferenceType = {
            type: this.type,
            id: this.reflection?.id,
            typeArguments:
                this.typeArguments && this.typeArguments.length > 0
                    ? this.typeArguments?.map((t) => serializer.toObject(t))
                    : undefined,
            name: this.name,
        };

        if (this.qualifiedName && this.package) {
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

    override toString() {
        if (!this.declaration.children && this.declaration.signatures) {
            return "Function";
        } else {
            return "Object";
        }
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

    override toString() {
        return `...${wrap(this.elementType, BINDING_POWERS.rest)}`;
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

    override toString() {
        return [
            "`",
            this.head,
            ...this.tail.map(([type, text]) => {
                return "${" + type + "}" + text;
            }),
            "`",
        ].join("");
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

    override toString() {
        return "[" + this.elements.join(", ") + "]";
    }

    override toObject(serializer: Serializer): JSONOutput.TupleType {
        return {
            type: this.type,
            elements:
                this.elements.length > 0
                    ? this.elements.map((t) => serializer.toObject(t))
                    : undefined,
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
    override toString() {
        return `${this.name}${this.isOptional ? "?" : ""}: ${this.element}`;
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

    override toString(): string {
        return `${this.operator} ${this.target.toString()}`;
    }

    override toObject(serializer: Serializer): JSONOutput.TypeOperatorType {
        return {
            type: this.type,
            target: serializer.toObject(this.target),
            operator: this.operator,
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

    override toString(): string {
        return this.types.map((t) => wrap(t, BINDING_POWERS.union)).join(" | ");
    }

    private normalize() {
        const trueIndex = this.types.findIndex(
            (t) => t instanceof LiteralType && t.value === true
        );
        const falseIndex = this.types.findIndex(
            (t) => t instanceof LiteralType && t.value === false
        );

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

    override toString() {
        return this.name;
    }

    override toObject(): JSONOutput.UnknownType {
        return {
            type: this.type,
            name: this.name,
        };
    }
}
