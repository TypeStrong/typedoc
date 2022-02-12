import type { Type } from "../types";
import { Reflection } from "./abstract";
import type { DeclarationReflection } from "./declaration";
import { ReflectionKind } from "./kind";

export class TypeParameterReflection extends Reflection {
    override parent?: DeclarationReflection;

    type?: Type;

    default?: Type;

    /**
     * Create a new TypeParameterReflection instance.
     */
    constructor(
        name: string,
        constraint?: Type,
        defaultType?: Type,
        parent?: Reflection
    ) {
        super(name, ReflectionKind.TypeParameter, parent);
        this.type = constraint;
        this.default = defaultType;
    }
}
