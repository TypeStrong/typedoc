import { DefaultValueContainer, TypeContainer, TypeParameterContainer, TraverseCallback, TraverseProperty } from './abstract';
import { Type, ReflectionType } from '../types/index';
import { ContainerReflection } from './container';
import { SignatureReflection } from './signature';
import { TypeParameterReflection } from './type-parameter';
import { toArray } from 'lodash';

/**
 * Stores hierarchical type data.
 *
 * @see [[DeclarationReflection.typeHierarchy]]
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
export class DeclarationReflection extends ContainerReflection implements DefaultValueContainer, TypeContainer, TypeParameterContainer {
    /**
     * The type of the reflection.
     *
     * If the reflection represents a variable or a property, this is the value type.<br />
     * If the reflection represents a signature, this is the return type.
     */
    type?: Type;

    typeParameters?: TypeParameterReflection[];

    /**
     * A list of call signatures attached to this declaration.
     *
     * TypeDoc creates one declaration per function that may contain ore or more
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
    overwrites?: Type;

    /**
     * A type that points to the reflection this reflection has been inherited from.
     *
     * Applies to interface and class members.
     */
    inheritedFrom?: Type;

    /**
     * A type that points to the reflection this reflection is the implementation of.
     *
     * Applies to class members.
     */
    implementationOf?: Type;

    /**
     * A list of all types this reflection extends (e.g. the parent classes).
     */
    extendedTypes?: Type[];

    /**
     * A list of all types that extend this reflection (e.g. the subclasses).
     */
    extendedBy?: Type[];

    /**
     * A list of all types this reflection implements.
     */
    implementedTypes?: Type[];

    /**
     * A list of all types that implement this reflection.
     */
    implementedBy?: Type[];

    /**
     * Contains a simplified representation of the type hierarchy suitable for being
     * rendered in templates.
     */
    typeHierarchy?: DeclarationHierarchy;

    hasGetterOrSetter(): boolean {
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

    /**
     * Traverse all potential child reflections of this reflection.
     *
     * The given callback will be invoked for all children, signatures and type parameters
     * attached to this reflection.
     *
     * @param callback  The callback function that should be applied for each child reflection.
     */
    traverse(callback: TraverseCallback) {
        for (const parameter of toArray(this.typeParameters)) {
            if (callback(parameter, TraverseProperty.TypeParameter) === false) {
                return;
            }
        }

        if (this.type instanceof ReflectionType) {
            if (callback(this.type.declaration, TraverseProperty.TypeLiteral) === false) {
                return;
            }
        }

        for (const signature of toArray(this.signatures)) {
            if (callback(signature, TraverseProperty.Signatures) === false) {
                return;
            }
        }

        if (this.indexSignature) {
            if (callback(this.indexSignature, TraverseProperty.IndexSignature) === false) {
                return;
            }
        }

        if (this.getSignature) {
            if (callback(this.getSignature, TraverseProperty.GetSignature) === false) {
                return;
            }
        }

        if (this.setSignature) {
            if (callback(this.setSignature, TraverseProperty.SetSignature) === false) {
                return;
            }
        }

        super.traverse(callback);
    }

    /**
     * Return a raw object representation of this reflection.
     * @deprecated Use serializers instead
     */
    toObject(): any {
        let result = super.toObject();

        if (this.type) {
            result.type = this.type.toObject();
        }

        if (this.defaultValue) {
            result.defaultValue = this.defaultValue;
        }

        if (this.overwrites) {
            result.overwrites = this.overwrites.toObject();
        }

        if (this.inheritedFrom) {
            result.inheritedFrom = this.inheritedFrom.toObject();
        }

        if (this.extendedTypes) {
            result.extendedTypes = this.extendedTypes.map((t) => t.toObject());
        }

        if (this.extendedBy) {
            result.extendedBy = this.extendedBy.map((t) => t.toObject());
        }

        if (this.implementedTypes) {
            result.implementedTypes = this.implementedTypes.map((t) => t.toObject());
        }

        if (this.implementedBy) {
            result.implementedBy = this.implementedBy.map((t) => t.toObject());
        }

        if (this.implementationOf) {
            result.implementationOf = this.implementationOf.toObject();
        }

        return result;
    }

    /**
     * Return a string representation of this reflection.
     */
    toString(): string {
        let result = super.toString();

        if (this.typeParameters) {
            const parameters: string[] = [];
            this.typeParameters.forEach((parameter) => {
                parameters.push(parameter.name);
            });
            result += '<' + parameters.join(', ') + '>';
        }

        if (this.type) {
            result += ':' + this.type.toString();
        }

        return result;
    }
}
