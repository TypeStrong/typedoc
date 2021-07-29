export { Application } from "./lib/application";

export { EventDispatcher, Event } from "./lib/utils/events";
export { resetReflectionID } from "./lib/models/reflections/abstract";
export { normalizePath } from "./lib/utils/fs";
export * from "./lib/models/reflections";
export { Converter } from "./lib/converter";
export { Renderer } from "./lib/output/renderer";
export {
    DefaultTheme,
    NavigationBuilder,
} from "./lib/output/themes/default/DefaultTheme";
export { NavigationItem } from "./lib/output/models/NavigationItem";
export { UrlMapping } from "./lib/output/models/UrlMapping";

export {
    BindOption,
    Options,
    ParameterHint,
    ParameterType,
    TSConfigReader,
    TypeDocReader,
    ArgumentsReader,
} from "./lib/utils";

export type {
    OptionsReader,
    TypeDocOptions,
    TypeDocOptionMap,
    KeyToDeclaration,
    DeclarationOption,
    DeclarationOptionBase,
    StringDeclarationOption,
    NumberDeclarationOption,
    BooleanDeclarationOption,
    ArrayDeclarationOption,
    MixedDeclarationOption,
    MapDeclarationOption,
    DeclarationOptionToOptionType,
    SortStrategy,
} from "./lib/utils";

export { JSONOutput } from "./lib/serialization";

import * as TypeScript from "typescript";
export { TypeScript };
