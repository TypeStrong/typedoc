module td.models
{
    /**
     * Represents a type which has it's own reflection like literal types.
     *
     * ~~~
     * var value:{subValueA;subValueB;subValueC;};
     * ~~~
     */
    export class ReflectionType extends Type
    {
        /**
         * The reflection of the type.
         */
        declaration:DeclarationReflection;



        /**
         * Create a new instance of ReflectionType.
         *
         * @param declaration  The reflection of the type.
         */
        constructor(declaration:DeclarationReflection) {
            super();
            this.declaration = declaration;
        }


        /**
         * Return a raw object representation of this type.
         */
        toObject():any {
            var result:any = super.toObject();
            result.type = 'reflection';

            if (this.declaration) {
                result.declaration = this.declaration.toObject();
            }

            return result;
        }


        /**
         * Return a string representation of this type.
         */
        toString() {
            if (!this.declaration.children && this.declaration.signatures) {
                return 'function';
            } else {
                return 'object';
            }
        }
    }
}