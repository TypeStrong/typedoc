import type { SomeType } from "../types";
import { Reflection } from "./abstract";
import type { DeclarationReflection } from "./declaration";
import { ReflectionKind } from "./kind";
import type { Serializer, JSONOutput } from "../../serialization";

export class TypeParameterReflection extends Reflection {
    override parent?: DeclarationReflection;

    type?: SomeType;

    default?: SomeType;

    constructor(
        name: string,
        constraint?: SomeType,
        defaultType?: SomeType,
        parent?: Reflection
    ) {
        super(name, ReflectionKind.TypeParameter, parent);
        this.type = constraint;
        this.default = defaultType;
    }

    override toObject(
        serializer: Serializer
    ): JSONOutput.TypeParameterReflection {
        return {
            ...super.toObject(serializer),
            type: this.type && serializer.toObject(this.type),
            default: this.default && serializer.toObject(this.default),
        };
    }
}
