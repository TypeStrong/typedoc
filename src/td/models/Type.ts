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
        isArray:boolean;


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
    }
}