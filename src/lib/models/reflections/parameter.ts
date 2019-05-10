import { Type, ReflectionType } from '../types/index';
import { Reflection, DefaultValueContainer, TypeContainer, TraverseCallback, TraverseProperty } from './abstract';
import { SignatureReflection } from './signature';

export class ParameterReflection extends Reflection implements DefaultValueContainer, TypeContainer {
    parent?: SignatureReflection;

    defaultValue?: string;

    type?: Type;

    /**
     * Traverse all potential child reflections of this reflection.
     *
     * The given callback will be invoked for all children, signatures and type parameters
     * attached to this reflection.
     *
     * @param callback  The callback function that should be applied for each child reflection.
     */
    traverse(callback: TraverseCallback) {
        if (this.type instanceof ReflectionType) {
            if (callback(this.type.declaration, TraverseProperty.TypeLiteral) === false) {
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
        const result = super.toObject();

        if (this.type) {
            result.type = this.type.toObject();
        }

        if (this.defaultValue) {
            result.defaultValue = this.defaultValue;
        }

        return result;
    }

    /**
     * Return a string representation of this reflection.
     */
    toString() {
        return super.toString() + (this.type ? ':' + this.type.toString() :  '');
    }
}
