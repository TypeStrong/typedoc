import { Type } from "./abstract";

/**
 * Represents a mapped type.
 *
 * ```ts
 * { -readonly [K in keyof U & string as `a${K}`]?: Foo }
 * ```
 */
export class MappedType extends Type {
    readonly type = "mapped";

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

    clone(): Type {
        return new MappedType(
            this.parameter,
            this.parameterType.clone(),
            this.templateType.clone(),
            this.readonlyModifier,
            this.optionalModifier,
            this.nameType?.clone()
        );
    }

    equals(other: Type): boolean {
        if (!(other instanceof MappedType)) {
            return false;
        }

        if (this.nameType && other.nameType) {
            if (!this.nameType.equals(other.nameType)) {
                return false;
            }
        } else if (this.nameType !== other.nameType) {
            return false;
        }

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

        const name = this.nameType ? ` as ${this.nameType}` : "";

        return `{ ${read}[${this.parameter} in ${this.parameterType}${name}]${opt}: ${this.templateType}}`;
    }
}
