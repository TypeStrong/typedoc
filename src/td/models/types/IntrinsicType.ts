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