import { AbstractComponent } from "../utils/component.js";
import type { Converter } from "./converter.js";

export abstract class ConverterComponent extends AbstractComponent<
    Converter,
    {}
> {}
