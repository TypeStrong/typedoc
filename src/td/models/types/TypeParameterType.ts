module td.models
{
    /**
     * Represents a type parameter type.
     *
     * ~~~
     * var value:T;
     * ~~~
     */
    export class TypeParameterType extends Type
    {
        /**
         *
         */
        name:string;

        constraint:Type;


        /**
         * Return a raw object representation of this type.
         */
        toObject():any {
            var result:any = super.toObject();
            result.type = 'typeParameter';
            result.name = this.name;

            if (this.constraint) {
                result.constraint = this.constraint.toObject();
            }

            return result;
        }


        /**
         * Return a string representation of this type.
         */
        toString() {
            return this.name;
        }
    }
}