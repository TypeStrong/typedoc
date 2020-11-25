import { Component, AbstractComponent } from "../utils/component";
import { Converter } from "./converter";

export { Component };

export abstract class ConverterComponent extends AbstractComponent<Converter> {}
