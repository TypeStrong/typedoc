module td
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