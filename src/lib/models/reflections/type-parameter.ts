import type { SomeType } from "../types";
import { Reflection, type TraverseCallback } from "./abstract";
import type { DeclarationReflection } from "./declaration";
import { ReflectionKind } from "./kind";
import type { Serializer, JSONOutput, Deserializer } from "../../serialization";
import type { SignatureReflection } from "./signature";

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
    (typeof VarianceModifier)[keyof typeof VarianceModifier];

/**
 * @category Reflections
 */
export class TypeParameterReflection extends Reflection {
    readonly variant = "typeParam";

    override parent?: DeclarationReflection | SignatureReflection;

    type?: SomeType;

    default?: SomeType;

    varianceModifier?: VarianceModifier;

    constructor(
        name: string,
        parent: Reflection,
        varianceModifier: VarianceModifier | undefined,
    ) {
        super(name, ReflectionKind.TypeParameter, parent);
        this.varianceModifier = varianceModifier;
    }

    override toObject(
        serializer: Serializer,
    ): JSONOutput.TypeParameterReflection {
        return {
            ...super.toObject(serializer),
            variant: this.variant,
            type: serializer.toObject(this.type),
            default: serializer.toObject(this.default),
            varianceModifier: this.varianceModifier,
        };
    }

    override fromObject(
        de: Deserializer,
        obj: JSONOutput.TypeParameterReflection,
    ): void {
        super.fromObject(de, obj);
        this.type = de.reviveType(obj.type);
        this.default = de.reviveType(obj.default);
        this.varianceModifier = obj.varianceModifier;
    }

    override traverse(_callback: TraverseCallback): void {
        // do nothing, no child reflections.
    }
}
