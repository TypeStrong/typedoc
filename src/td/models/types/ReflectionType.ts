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
            if (!this.declaration.children && this.declaration.signatures) {
                return 'function';
            } else {
                return 'object';
            }
        }
    }
}