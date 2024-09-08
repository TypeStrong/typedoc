import type { SomeType } from "../index.js";
import { ReflectionType } from "../types.js";
import {
    Reflection,
    type TraverseCallback,
    TraverseProperty,
} from "./abstract.js";
import type { SignatureReflection } from "./signature.js";
import type {
    Serializer,
    JSONOutput,
    Deserializer,
} from "../../serialization/index.js";

/**
 * @category Reflections
 */
export class ParameterReflection extends Reflection {
    readonly variant = "param";

    declare parent?: SignatureReflection;

    defaultValue?: string;

    type?: SomeType;

    override traverse(callback: TraverseCallback) {
        if (this.type instanceof ReflectionType) {
            if (
                callback(
                    this.type.declaration,
                    TraverseProperty.TypeLiteral,
                ) === false
            ) {
                return;
            }
        }
    }

    override isParameter(): this is ParameterReflection {
        return true;
    }

    /**
     * Return a string representation of this reflection.
     */
    override toString() {
        return (
            super.toString() + (this.type ? ": " + this.type.toString() : "")
        );
    }

    override toObject(serializer: Serializer): JSONOutput.ParameterReflection {
        return {
            ...super.toObject(serializer),
            variant: this.variant,
            type: serializer.toObject(this.type),
            defaultValue: this.defaultValue,
        };
    }

    override fromObject(
        de: Deserializer,
        obj: JSONOutput.ParameterReflection,
    ): void {
        super.fromObject(de, obj);
        this.type = de.reviveType(obj.type);
        this.defaultValue = obj.defaultValue;
    }
}
