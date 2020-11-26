import { Type } from "./abstract";

/**
 * TS 4.1 template literal types
 * ```ts
 * type Z = `${'a' | 'b'}${'a' | 'b'}`
 * ```
 */
export class TemplateLiteralType extends Type {
    readonly type = "template-literal";

    head: string;
    tail: [Type, string][];

    constructor(head: string, tail: [Type, string][]) {
        super();
        this.head = head;
        this.tail = tail;
    }

    clone(): Type {
        return new TemplateLiteralType(
            this.head,
            this.tail.map(([type, text]) => [type.clone(), text])
        );
    }

    equals(other: Type): boolean {
        return (
            other instanceof TemplateLiteralType &&
            this.head === other.head &&
            this.tail.length === other.tail.length &&
            this.tail.every(([type, text], i) => {
                return (
                    type.equals(other.tail[i][0]) && text === other.tail[i][1]
                );
            })
        );
    }

    toString() {
        return [
            "`",
            this.head,
            ...this.tail.map(([type, text]) => {
                return "${" + type + "}" + text;
            }),
            "`",
        ].join("");
    }
}
