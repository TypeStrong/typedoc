module td
{
    /**
     * Represents a string literal type.
     *
     * ~~~
     * var value:"DIV";
     * ~~~
     */
    export class StringLiteralType extends Type
    {
        /**
         * The string literal value.
         */
        value:string;


        /**
         * Create a new instance of StringLiteralType.
         *
         * @param value The string literal value.
         */
        constructor(value:string) {
            super();
            this.value = value;
        }


        /**
         * Return a raw object representation of this type.
         */
        toObject():any {
            var result:any = super.toObject();
            result.type = 'stringLiteral';
            result.value = this.value;
            return result;
        }


        /**
         * Return a string representation of this type.
         */
        toString():string {
            return '"' + this.value + '"';
        }
    }
}