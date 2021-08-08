import type { Type } from "../types";
import { Reflection, ReflectionKind, TypeContainer } from "./abstract";
import type { DeclarationReflection } from "./declaration";

export class TypeParameterReflection
    extends Reflection
    implements TypeContainer
{
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
