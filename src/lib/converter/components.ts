import * as ts from "typescript";

import { Component, AbstractComponent } from "../utils/component";
import { Reflection } from "../models/reflections/abstract";
import { Context } from "./context";
import { Converter } from "./converter";

export { Component };

export abstract class ConverterComponent extends AbstractComponent<Converter> {}

export abstract class ConverterNodeComponent<
    T extends ts.Node
> extends ConverterComponent {
    /**
     * List of supported TypeScript syntax kinds.
     */
    abstract supports: ts.SyntaxKind[];

    abstract convert(context: Context, node: T): Reflection | undefined;
}
