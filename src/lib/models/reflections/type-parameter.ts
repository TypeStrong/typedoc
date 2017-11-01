import { Type, TypeParameterType } from '../types/index';
import { Reflection, ReflectionKind, TypeContainer } from './abstract';
import { DeclarationReflection } from './declaration';

export class TypeParameterReflection extends Reflection implements TypeContainer {
    parent: DeclarationReflection;

    type: Type;

    /**
     * Create a new TypeParameterReflection instance.
     */
    constructor(parent?: Reflection, type?: TypeParameterType) {
        super(parent, type.name, ReflectionKind.TypeParameter);
        this.type = type.constraint;
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

        return result;
    }
}
