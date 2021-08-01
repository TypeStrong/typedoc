import { Type, ReflectionType } from "../types";
import {
    Reflection,
    DefaultValueContainer,
    TypeContainer,
    TraverseCallback,
    TraverseProperty,
} from "./abstract";
import { SignatureReflection } from "./signature";

export class ParameterReflection
    extends Reflection
    implements DefaultValueContainer, TypeContainer
{
    override parent?: SignatureReflection;

    defaultValue?: string;

    type?: Type;

    /**
     * Traverse all potential child reflections of this reflection.
     *
     * The given callback will be invoked for all children, signatures and type parameters
     * attached to this reflection.
     *
     * @param callback  The callback function that should be applied for each child reflection.
     */
    override traverse(callback: TraverseCallback) {
        if (this.type instanceof ReflectionType) {
            if (
                callback(
                    this.type.declaration,
                    TraverseProperty.TypeLiteral
                ) === false
            ) {
                return;
            }
        }

        super.traverse(callback);
    }

    /**
     * Return a string representation of this reflection.
     */
    override toString() {
        return super.toString() + (this.type ? ":" + this.type.toString() : "");
    }
}
