module td.models
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
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone():Type {
            var clone = new TupleType(this.elements);
            clone.isArray = this.isArray;
            return clone;
        }


        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type:TupleType):boolean {
            if (!(type instanceof TupleType)) return false;
            if (type.isArray != this.isArray) return false;
            return Type.isTypeListEqual(type.elements, this.elements);
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

            return '[' + names.join(', ') + ']';
        }
    }
}