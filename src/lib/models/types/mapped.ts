import { Type } from "./abstract";

/**
 * Represents a mapped type.
 *
 * ```ts
 * { -readonly [K in keyof U & string as `a${K}`]?: Foo }
 * ```
 */
export class MappedType extends Type {
    override readonly type = "mapped";

    constructor(
        public parameter: string,
        public parameterType: Type,
        public templateType: Type,
        public readonlyModifier?: "+" | "-",
        public optionalModifier?: "+" | "-",
        public nameType?: Type
    ) {
        super();
    }

    override clone(): Type {
        return new MappedType(
            this.parameter,
            this.parameterType.clone(),
            this.templateType.clone(),
            this.readonlyModifier,
            this.optionalModifier,
            this.nameType?.clone()
        );
    }

    override toString(): string {
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

        const name = this.nameType ? ` as ${this.nameType}` : "";

        return `{ ${read}[${this.parameter} in ${this.parameterType}${name}]${opt}: ${this.templateType}}`;
    }
}
