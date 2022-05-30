import type { SomeType } from "../types";
import { Reflection } from "./abstract";
import type { DeclarationReflection } from "./declaration";
import { ReflectionKind } from "./kind";
import type { Serializer, JSONOutput } from "../../serialization";

/**
 * Modifier flags for type parameters, added in TS 4.7
 * @enum
 */
export const VarianceModifier = {
    in: "in",
    out: "out",
    inOut: "in out",
} as const;
export type VarianceModifier =
    typeof VarianceModifier[keyof typeof VarianceModifier];

export class TypeParameterReflection extends Reflection {
    override parent?: DeclarationReflection;

    type?: SomeType;

    default?: SomeType;

    varianceModifier?: VarianceModifier;

    constructor(
        name: string,
        constraint: SomeType | undefined,
        defaultType: SomeType | undefined,
        parent: Reflection,
        varianceModifier: VarianceModifier | undefined
    ) {
        super(name, ReflectionKind.TypeParameter, parent);
        this.type = constraint;
        this.default = defaultType;
        this.varianceModifier = varianceModifier;
    }

    override toObject(
        serializer: Serializer
    ): JSONOutput.TypeParameterReflection {
        return {
            ...super.toObject(serializer),
            type: this.type && serializer.toObject(this.type),
            default: this.default && serializer.toObject(this.default),
            varianceModifier: this.varianceModifier,
        };
    }
}
