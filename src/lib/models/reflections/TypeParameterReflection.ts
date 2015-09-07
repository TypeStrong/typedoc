import {Reflection, ReflectionKind, ITypeContainer} from "../Reflection";
import {DeclarationReflection} from "./DeclarationReflection";
import {Type} from "../Type";
import {TypeParameterType} from "../types/TypeParameterType";


export class TypeParameterReflection extends Reflection implements ITypeContainer
{
    parent:DeclarationReflection;

    type:Type;


    /**
     * Create a new TypeParameterReflection instance.
     */
    constructor(parent?:Reflection, type?:TypeParameterType) {
        super(parent, type.name, ReflectionKind.TypeParameter);
        this.type = type.constraint;
    }


    /**
     * Return a raw object representation of this reflection.
     */
    toObject():any {
        var result = super.toObject();

        if (this.type) {
            result.type = this.type.toObject();
        }

        return result;
    }
}
