import { Type } from "./abstract";

/**
 * TS 4.1 template literal types
 * ```ts
 * type Z = `${'a' | 'b'}${'a' | 'b'}`
 * ```
 */
export class TemplateLiteralType extends Type {
    override readonly type = "template-literal";

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

    override toString() {
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
