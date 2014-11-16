module td
{

    export class ReflectionType extends Type
    {
        declaration:DeclarationReflection;


        constructor(declaration:DeclarationReflection) {
            super();
            this.declaration = declaration;
        }


        toString() {
            return 'object';
        }
    }
}