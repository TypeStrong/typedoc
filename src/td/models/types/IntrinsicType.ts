module td.models
{
    /**
     * Represents an intrinsic type like `string` or `boolean`.
     *
     * ~~~
     * var value:number;
     * ~~~
     */
    export class IntrinsicType extends Type
    {
        /**
         * The name of the intrinsic type like `string` or `boolean`.
         */
        name:string;



        /**
         * Create a new instance of IntrinsicType.
         *
         * @param name  The name of the intrinsic type like `string` or `boolean`.
         */
        constructor(name:string) {
            super();
            this.name = name;
        }


        /**
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone():Type {
            var clone = new IntrinsicType(this.name);
            clone.isArray = this.isArray;
            return clone;
        }


        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type:IntrinsicType):boolean {
            return type instanceof IntrinsicType &&
                type.isArray == this.isArray &&
                type.name == this.name;
        }


        /**
         * Return a raw object representation of this type.
         */
        toObject():any {
            var result:any = super.toObject();
            result.type = 'instrinct';
            result.name = this.name;
            return result;
        }


        /**
         * Return a string representation of this type.
         */
        toString() {
            return this.name + (this.isArray ? '[]' : '');
        }
    }
}