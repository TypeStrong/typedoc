import type * as ts from "typescript";
import type { SomeType } from "..";
import { ReferenceType, ReflectionType, Type } from "../types";
import { type TraverseCallback, TraverseProperty } from "./abstract";
import { ContainerReflection } from "./container";
import type { SignatureReflection } from "./signature";
import type { TypeParameterReflection } from "./type-parameter";
import type { Serializer, JSONOutput } from "../../serialization";

/**
 * Stores hierarchical type data.
 *
 * @see {@link DeclarationReflection.typeHierarchy}
 */
export interface DeclarationHierarchy {
    /**
     * The types represented by this node in the hierarchy.
     */
    types: Type[];

    /**
     * The next hierarchy level.
     */
    next?: DeclarationHierarchy;

    /**
     * Is this the entry containing the target type?
     */
    isTarget?: boolean;
}

/**
 * A reflection that represents a single declaration emitted by the TypeScript compiler.
 *
 * All parts of a project are represented by DeclarationReflection instances. The actual
 * kind of a reflection is stored in its ´kind´ member.
 */
export class DeclarationReflection extends ContainerReflection {
    /**
     * The escaped name of this declaration assigned by the TS compiler if there is an associated symbol.
     * This is used to retrieve properties for analyzing inherited members.
     * @internal
     */
    escapedName?: ts.__String;

    /**
     * The type of the reflection.
     *
     * If the reflection represents a variable or a property, this is the value type.<br />
     * If the reflection represents a signature, this is the return type.
     */
    type?: SomeType;

    typeParameters?: TypeParameterReflection[];

    /**
     * A list of call signatures attached to this declaration.
     *
     * TypeDoc creates one declaration per function that may contain one or more
     * signature reflections.
     */
    signatures?: SignatureReflection[];

    /**
     * The index signature of this declaration.
     */
    indexSignature?: SignatureReflection;

    /**
     * The get signature of this declaration.
     */
    getSignature?: SignatureReflection;

    /**
     * The set signature of this declaration.
     */
    setSignature?: SignatureReflection;

    /**
     * The default value of this reflection.
     *
     * Applies to function parameters.
     */
    defaultValue?: string;

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

    /**
     * A list of all types this reflection extends (e.g. the parent classes).
     */
    extendedTypes?: Type[];

    /**
     * A list of all types that extend this reflection (e.g. the subclasses).
     */
    extendedBy?: ReferenceType[];

    /**
     * A list of all types this reflection implements.
     */
    implementedTypes?: Type[];

    /**
     * A list of all types that implement this reflection.
     */
    implementedBy?: ReferenceType[];

    /**
     * Contains a simplified representation of the type hierarchy suitable for being
     * rendered in templates.
     */
    typeHierarchy?: DeclarationHierarchy;

    override hasGetterOrSetter(): boolean {
        return !!this.getSignature || !!this.setSignature;
    }

    getAllSignatures(): SignatureReflection[] {
        let result: SignatureReflection[] = [];

        if (this.signatures) {
            result = result.concat(this.signatures);
        }
        if (this.indexSignature) {
            result.push(this.indexSignature);
        }
        if (this.getSignature) {
            result.push(this.getSignature);
        }
        if (this.setSignature) {
            result.push(this.setSignature);
        }

        return result;
    }

    /** @internal */
    getNonIndexSignatures(): SignatureReflection[] {
        return ([] as SignatureReflection[]).concat(
            this.signatures ?? [],
            this.setSignature ?? [],
            this.getSignature ?? []
        );
    }

    /**
     * Traverse all potential child reflections of this reflection.
     *
     * The given callback will be invoked for all children, signatures and type parameters
     * attached to this reflection.
     *
     * @param callback  The callback function that should be applied for each child reflection.
     */
    override traverse(callback: TraverseCallback) {
        for (const parameter of this.typeParameters ?? []) {
            if (callback(parameter, TraverseProperty.TypeParameter) === false) {
                return;
            }
        }

        if (this.type instanceof ReflectionType) {
            if (
                callback(
                    this.type.declaration,
                    TraverseProperty.TypeLiteral
                ) === false
            ) {
                return;
            }
        }

        for (const signature of this.signatures ?? []) {
            if (callback(signature, TraverseProperty.Signatures) === false) {
                return;
            }
        }

        if (this.indexSignature) {
            if (
                callback(
                    this.indexSignature,
                    TraverseProperty.IndexSignature
                ) === false
            ) {
                return;
            }
        }

        if (this.getSignature) {
            if (
                callback(this.getSignature, TraverseProperty.GetSignature) ===
                false
            ) {
                return;
            }
        }

        if (this.setSignature) {
            if (
                callback(this.setSignature, TraverseProperty.SetSignature) ===
                false
            ) {
                return;
            }
        }

        super.traverse(callback);
    }

    /**
     * Return a string representation of this reflection.
     */
    override toString(): string {
        let result = super.toString();

        if (this.typeParameters) {
            const parameters: string[] = this.typeParameters.map(
                (parameter) => parameter.name
            );
            result += "<" + parameters.join(", ") + ">";
        }

        if (this.type) {
            result += ":" + this.type.toString();
        }

        return result;
    }

    override toObject(
        serializer: Serializer
    ): JSONOutput.DeclarationReflection {
        return {
            ...super.toObject(serializer),
            typeParameter:
                this.typeParameters && this.typeParameters.length > 0
                    ? this.typeParameters.map((type) =>
                          serializer.toObject(type)
                      )
                    : undefined,
            type: this.type && serializer.toObject(this.type),
            signatures: this.signatures?.map((sig) => serializer.toObject(sig)),
            indexSignature:
                this.indexSignature && serializer.toObject(this.indexSignature),
            getSignature: this.getSignature && [
                serializer.toObject(this.getSignature),
            ],
            setSignature: this.setSignature && [
                serializer.toObject(this.setSignature),
            ],
            defaultValue: this.defaultValue,
            overwrites: this.overwrites && serializer.toObject(this.overwrites),
            inheritedFrom:
                this.inheritedFrom && serializer.toObject(this.inheritedFrom),
            implementationOf:
                this.implementationOf &&
                serializer.toObject(this.implementationOf),
            extendedTypes: this.extendedTypes?.map((type) =>
                serializer.toObject(type)
            ),
            extendedBy: this.extendedBy?.map((type) =>
                serializer.toObject(type)
            ),
            implementedTypes: this.implementedTypes?.map((type) =>
                serializer.toObject(type)
            ),
            implementedBy: this.implementedBy?.map((type) =>
                serializer.toObject(type)
            ),
        };
    }
}
