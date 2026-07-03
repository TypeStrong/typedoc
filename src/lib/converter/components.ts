import { AbstractComponent } from "#node-utils";
import type { Converter } from "./converter.js";

export abstract class ConverterComponent extends AbstractComponent<
    Converter,
    {}
> {}
