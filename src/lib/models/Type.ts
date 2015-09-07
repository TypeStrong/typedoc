module td.models
{
    /**
     * Base class of all type definitions.
     *
     * Instances of this class are also used to represent the type `void`.
     */
    export class Type
    {
        /**
         * Is this an array type?
         */
        isArray:boolean = false;



        /**
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone():Type {
            var clone = new Type();
            clone.isArray = this.isArray;
            return clone;
        }


        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type:Type):boolean {
            return false;
        }


        /**
         * Return a raw object representation of this type.
         */
        toObject():any {
            var result:any = {};
            result.type = 'void';

            if (this.isArray) {
                result.isArray = this.isArray;
            }

            return result;
        }


        /**
         * Return a string representation of this type.
         */
        toString():string {
            return 'void';
        }


        /**
         * Test whether the two given list of types contain equal types.
         *
         * @param a
         * @param b
         */
        static isTypeListSimiliar(a:Type[], b:Type[]):boolean {
            if (a.length != b.length) return false;
            outerLoop: for (var an = 0, count = a.length; an < count; an++) {
                var at = a[an];
                for (var bn = 0; bn < count; bn++) {
                    if (b[bn].equals(at)) continue outerLoop;
                }

                return false;
            }

            return true;
        }


        /**
         * Test whether the two given list of types are equal.
         *
         * @param a
         * @param b
         */
        static isTypeListEqual(a:Type[], b:Type[]):boolean {
            if (a.length != b.length) return false;
            for (var index = 0, count = a.length; index < count; index++) {
                if (!a[index].equals(b[index])) {
                    return false;
                }
            }

            return true;
        }
    }
}