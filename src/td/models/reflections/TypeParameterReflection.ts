module td
{
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
    }
}
