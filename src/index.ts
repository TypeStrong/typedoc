export { Application } from "./lib/application";

export { EventDispatcher, Event } from "./lib/utils/events";
export { resetReflectionID } from "./lib/models/reflections/abstract";
export { normalizePath } from "./lib/utils/fs";
export * from "./lib/models";
export { Converter, Context } from "./lib/converter";
export type { DocumentationEntryPoint } from "./lib/converter";

export {
    Renderer,
    DefaultTheme,
    DefaultThemeRenderContext,
    UrlMapping,
    Theme,
    PageEvent,
} from "./lib/output";
export type { RenderTemplate } from "./lib/output";

export {
    ArgumentsReader,
    BindOption,
    JSX,
    LogLevel,
    Logger,
    Options,
    ParameterHint,
    ParameterType,
    TSConfigReader,
    TypeDocReader,
} from "./lib/utils";

export type {
    OptionsReader,
    TypeDocOptions,
    TypeDocOptionMap,
    TypeDocOptionValues,
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
    ParameterTypeToOptionTypeMap,
} from "./lib/utils";

export type { EventMap, EventCallback } from "./lib/utils/events";

export {
    JSONOutput,
    Serializer,
    SerializerComponent,
} from "./lib/serialization";
export type { SerializeEventData } from "./lib/serialization";

import * as TypeScript from "typescript";
export { TypeScript };
