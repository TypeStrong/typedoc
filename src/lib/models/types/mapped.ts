import { Type } from "./abstract";

/**
 * Represents a mapped type.
 *
 * ```ts
 * { -readonly [K in keyof U]?: Foo }
 * ```
 */
export class MappedType extends Type {
    readonly type = "mapped";

    constructor(
        public parameter: string,
        public parameterType: Type,
        public templateType: Type,
        public readonlyModifier?: "+" | "-",
        public optionalModifier?: "+" | "-"
    ) {
        super();
    }

    clone(): Type {
        return new MappedType(
            this.parameter,
            this.parameterType.clone(),
            this.templateType.clone(),
            this.readonlyModifier,
            this.optionalModifier
        );
    }

    equals(other: Type): boolean {
        return (
            other instanceof MappedType &&
            other.parameter == this.parameter &&
            other.parameterType.equals(this.parameterType) &&
            other.templateType.equals(this.templateType) &&
            other.readonlyModifier === this.readonlyModifier &&
            other.optionalModifier === this.optionalModifier
        );
    }

    toString(): string {
        const read = {
            "+": "readonly",
            "-": "-readonly",
            "": "",
        }[this.readonlyModifier ?? ""];

        const opt = {
            "+": "?",
            "-": "-?",
            "": "",
        }[this.optionalModifier ?? ""];

        return `{ ${read}[${this.parameter} in ${this.parameterType}]${opt}: ${this.templateType}}`;
    }
}
