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
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone():Type {
            var clone = new TypeParameterType();
            clone.isArray = this.isArray;
            clone.name = this.name;
            clone.constraint = this.constraint;
            return clone;
        }


        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type:TypeParameterType):boolean {
            if (!(type instanceof TypeParameterType)) {
                return false;
            }

            var constraintEquals;
            if (this.constraint && type.constraint) {
                constraintEquals = type.constraint.equals(this.constraint);
            } else if (!this.constraint && !type.constraint) {
                constraintEquals = true;
            } else {
                return false;
            }

            return constraintEquals &&
                type.isArray == this.isArray;
        }


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