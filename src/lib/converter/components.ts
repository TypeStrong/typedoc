import { Component, AbstractComponent } from "../utils/component.js";
import type { Converter } from "./converter.js";

export { Component };

export abstract class ConverterComponent extends AbstractComponent<
    Converter,
    {}
> {}
