import { DeclarationReflection } from "../reflections/declaration";
import { Type } from "./abstract";

/**
 * Represents a type which has it's own reflection like literal types.
 *
 * ~~~
 * let value: {subValueA;subValueB;subValueC;};
 * ~~~
 */
export class ReflectionType extends Type {
    /**
     * The reflection of the type.
     */
    declaration: DeclarationReflection;

    /**
     * The type name identifier.
     */
    override readonly type = "reflection";

    /**
     * Create a new instance of ReflectionType.
     *
     * @param declaration  The reflection of the type.
     */
    constructor(declaration: DeclarationReflection) {
        super();
        this.declaration = declaration;
    }

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        return new ReflectionType(this.declaration);
    }

    /**
     * Return a string representation of this type.
     */
    override toString() {
        if (!this.declaration.children && this.declaration.signatures) {
            return "function";
        } else {
            return "object";
        }
    }
}
