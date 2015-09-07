module td.models
{
    /**
     * Represents all unknown types.
     */
    export class UnknownType extends Type
    {
        /**
         * A string representation of the type as returned from TypeScript compiler.
         */
        name:string;


        /**
         * Create a new instance of UnknownType.
         *
         * @param name  A string representation of the type as returned from TypeScript compiler.
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
            var clone = new UnknownType(this.name);
            clone.isArray = this.isArray;
            return clone;
        }


        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type:UnknownType):boolean {
            return type instanceof UnknownType &&
                type.isArray == this.isArray &&
                type.name == this.name;
        }


        /**
         * Return a raw object representation of this type.
         */
        toObject():any {
            var result:any = super.toObject();
            result.type = 'unknown';
            result.name = this.name;
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