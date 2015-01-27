module td
{
    /**
     * Represents a tuple type.
     *
     * ~~~
     * var value:[string,boolean];
     * ~~~
     */
    export class TupleType extends Type
    {
        /**
         * The ordered type elements of the tuple type.
         */
        elements:Type[];


        /**
         * Create a new TupleType instance.
         *
         * @param elements  The ordered type elements of the tuple type.
         */
        constructor(elements:Type[]) {
            super();
            this.elements = elements;
        }


        /**
         * Return a raw object representation of this type.
         */
        toObject():any {
            var result:any = super.toObject();
            result.type = 'tuple';

            if (this.elements && this.elements.length) {
                result.elements = this.elements.map((e) => e.toObject());
            }

            return result;
        }


        /**
         * Return a string representation of this type.
         */
        toString() {
            var names = [];
            this.elements.forEach((element) => {
                names.push(element.toString())
            });
            return names.join(' | ');
        }
    }
}