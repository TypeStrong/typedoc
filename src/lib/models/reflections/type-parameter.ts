import { Type, TypeParameterType } from '../types/index';
import { Reflection, ReflectionKind, TypeContainer } from './abstract';
import { DeclarationReflection } from './declaration';

export class TypeParameterReflection extends Reflection implements TypeContainer {
    parent?: DeclarationReflection;

    type?: Type;

    default?: Type;

    /**
     * Create a new TypeParameterReflection instance.
     */
    constructor(type: TypeParameterType, parent?: Reflection) {
        super(type.name, ReflectionKind.TypeParameter, parent);
        this.type = type.constraint;
        this.default = type.default;
    }
}
