import type { Type } from "../types";
import { Reflection } from "./abstract";
import type { DeclarationReflection } from "./declaration";
import { ReflectionKind } from "./kind";
import type { TypeParameterReflection as JSONTypeParameterReflection } from "../../serialization/schema";

export class TypeParameterReflection extends Reflection {
    override parent?: DeclarationReflection;

    type?: Type;

    default?: Type;

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

    override toObject(): JSONTypeParameterReflection {
        return {
            ...super.toObject(),
            type: this.type?.toObject(),
            default: this.default?.toObject(),
        };
    }
}
