module td.models
{
    /**
     * Represents an union type.
     *
     * ~~~
     * var value:string | string[];
     * ~~~
     */
    export class UnionType extends Type
    {
        /**
         * The types this union consists of.
         */
        types:Type[];


        /**
         * Create a new TupleType instance.
         *
         * @param types  The types this union consists of.
         */
        constructor(types:Type[]) {
            super();
            this.types = types;
        }


        /**
         * Return a raw object representation of this type.
         */
        toObject():any {
            var result:any = super.toObject();
            result.type = 'union';

            if (this.types && this.types.length) {
                result.types = this.types.map((e) => e.toObject());
            }

            return result;
        }


        /**
         * Return a string representation of this type.
         */
        toString() {
            var names = [];
            this.types.forEach((element) => {
                names.push(element.toString())
            });

            return names.join(' | ');
        }
    }
}