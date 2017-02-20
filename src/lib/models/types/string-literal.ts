import {Type} from "./abstract";


/**
 * Represents a string literal type.
 *
 * ~~~
 * let value:"DIV";
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
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone():Type {
        const clone = new StringLiteralType(this.value);
        clone.isArray = this.isArray;
        return clone;
    }


    /**
     * Test whether this type equals the given type.
     *
     * @param type  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(type:StringLiteralType):boolean {
        return type instanceof StringLiteralType &&
            type.isArray == this.isArray &&
            type.value == this.value;
    }


    /**
     * Return a raw object representation of this type.
     */
    toObject():any {
        const result:any = super.toObject();
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
