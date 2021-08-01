import { Type } from "./abstract";

/**
 * Represents a conditional type.
 *
 * ~~~
 * let value: C extends E ? T : F;
 * let value2: Check extends Extends ? True : False;
 * ~~~
 */
export class ConditionalType extends Type {
    /**
     * The type name identifier.
     */
    override readonly type: string = "conditional";

    constructor(
        public checkType: Type,
        public extendsType: Type,
        public trueType: Type,
        public falseType: Type
    ) {
        super();
    }

    /**
     * Return a string representation of this type.
     */
    override toString() {
        return (
            this.checkType +
            " extends " +
            this.extendsType +
            " ? " +
            this.trueType +
            " : " +
            this.falseType
        );
    }
}
