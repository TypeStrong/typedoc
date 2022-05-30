import type { Type } from "../types";
import { Reflection } from "./abstract";
import type { DeclarationReflection } from "./declaration";
import { ReflectionKind } from "./kind";

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

    type?: Type;

    default?: Type;

    varianceModifier?: VarianceModifier;

    constructor(
        name: string,
        constraint: Type | undefined,
        defaultType: Type | undefined,
        parent: Reflection,
        varianceModifier: VarianceModifier | undefined
    ) {
        super(name, ReflectionKind.TypeParameter, parent);
        this.type = constraint;
        this.default = defaultType;
        this.varianceModifier = varianceModifier;
    }
}
