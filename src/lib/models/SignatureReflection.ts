import { type ReferenceType, ReflectionType, type SomeType } from "./types.js";
import { Reflection, type TraverseCallback, TraverseProperty } from "./Reflection.js";
import type { ParameterReflection } from "./ParameterReflection.js";
import type { TypeParameterReflection } from "./TypeParameterReflection.js";
import type { DeclarationReflection } from "./DeclarationReflection.js";
import type { ReflectionKind } from "./kind.js";
import type { Deserializer, JSONOutput, Serializer } from "#serialization";
import { SourceReference } from "./SourceReference.js";

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

    declare kind:
        | ReflectionKind.SetSignature
        | ReflectionKind.GetSignature
        | ReflectionKind.IndexSignature
        | ReflectionKind.CallSignature
        | ReflectionKind.ConstructorSignature;

    declare parent: DeclarationReflection;

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

    override isSignature(): this is SignatureReflection {
        return true;
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
        this.typeParameters = de.reviveMany(obj.typeParameters, (t) => de.constructReflection(t));
        this.parameters = de.reviveMany(obj.parameters, (t) => de.constructReflection(t));
        this.type = de.reviveType(obj.type);
        this.overwrites = de.reviveType(obj.overwrites);
        this.inheritedFrom = de.reviveType(obj.inheritedFrom);
        this.implementationOf = de.reviveType(obj.implementationOf);
    }
}
