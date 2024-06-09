import { type SomeType, ReflectionType, type ReferenceType } from "../types";
import {
    Reflection,
    TraverseProperty,
    type TraverseCallback,
} from "./abstract";
import type { ParameterReflection } from "./parameter";
import type { TypeParameterReflection } from "./type-parameter";
import type { DeclarationReflection } from "./declaration";
import type { ReflectionKind } from "./kind";
import type { Serializer, JSONOutput, Deserializer } from "../../serialization";
import { SourceReference } from "../sources/file";

/**
 * @category Reflections
 */
export class SignatureReflection extends Reflection {
    readonly variant = "signature";

    // ESLint is wrong, we're restricting types to be more narrow.
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(
        name: string,
        kind: SignatureReflection["kind"],
        parent: DeclarationReflection,
    ) {
        super(name, kind, parent);
    }

    override kind!:
        | ReflectionKind.SetSignature
        | ReflectionKind.GetSignature
        | ReflectionKind.IndexSignature
        | ReflectionKind.CallSignature
        | ReflectionKind.ConstructorSignature;

    override parent!: DeclarationReflection;

    /**
     * A list of all source files that contributed to this reflection.
     */
    sources?: SourceReference[];

    parameters?: ParameterReflection[];

    typeParameters?: TypeParameterReflection[];

    type?: SomeType;

    /**
     * A type that points to the reflection that has been overwritten by this reflection.
     *
     * Applies to interface and class members.
     */
    overwrites?: ReferenceType;

    /**
     * A type that points to the reflection this reflection has been inherited from.
     *
     * Applies to interface and class members.
     */
    inheritedFrom?: ReferenceType;

    /**
     * A type that points to the reflection this reflection is the implementation of.
     *
     * Applies to class members.
     */
    implementationOf?: ReferenceType;

    override traverse(callback: TraverseCallback) {
        if (this.type instanceof ReflectionType) {
            if (
                callback(
                    this.type.declaration,
                    TraverseProperty.TypeLiteral,
                ) === false
            ) {
                return;
            }
        }

        for (const parameter of this.typeParameters?.slice() || []) {
            if (callback(parameter, TraverseProperty.TypeParameter) === false) {
                return;
            }
        }

        for (const parameter of this.parameters?.slice() || []) {
            if (callback(parameter, TraverseProperty.Parameters) === false) {
                return;
            }
        }
    }

    /**
     * Return a string representation of this reflection.
     */
    override toString(): string {
        let result = super.toString();

        if (this.typeParameters) {
            const parameters: string[] = this.typeParameters.map(
                (parameter) => parameter.name,
            );
            result += "<" + parameters.join(", ") + ">";
        }

        if (this.type) {
            result += ": " + this.type.toString();
        }

        return result;
    }

    override toObject(serializer: Serializer): JSONOutput.SignatureReflection {
        return {
            ...super.toObject(serializer),
            variant: this.variant,
            sources: serializer.toObjectsOptional(this.sources),
            typeParameters: serializer.toObjectsOptional(this.typeParameters),
            parameters: serializer.toObjectsOptional(this.parameters),
            type: serializer.toObject(this.type),
            overwrites: serializer.toObject(this.overwrites),
            inheritedFrom: serializer.toObject(this.inheritedFrom),
            implementationOf: serializer.toObject(this.implementationOf),
        };
    }

    override fromObject(
        de: Deserializer,
        obj: JSONOutput.SignatureReflection,
    ): void {
        super.fromObject(de, obj);

        this.sources = de.reviveMany(
            obj.sources,
            (t) => new SourceReference(t.fileName, t.line, t.character),
        );
        if (obj.typeParameter) {
            this.typeParameters = de.reviveMany(obj.typeParameter, (t) =>
                de.constructReflection(t),
            );
        } else {
            this.typeParameters = de.reviveMany(obj.typeParameters, (t) =>
                de.constructReflection(t),
            );
        }
        this.parameters = de.reviveMany(obj.parameters, (t) =>
            de.constructReflection(t),
        );
        this.type = de.reviveType(obj.type);
        this.overwrites = de.reviveType(obj.overwrites);
        this.inheritedFrom = de.reviveType(obj.inheritedFrom);
        this.implementationOf = de.reviveType(obj.implementationOf);
    }
}
