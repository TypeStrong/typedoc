export { Application } from "./lib/application";

export { EventDispatcher, Event } from "./lib/utils/events";
export { resetReflectionID } from "./lib/models/reflections/abstract";
export { normalizePath } from "./lib/utils/fs";
export * from "./lib/models";
export { Converter, Context } from "./lib/converter";

export {
    Renderer,
    DefaultTheme,
    DefaultThemeRenderContext,
    UrlMapping,
    Theme,
    PageEvent,
    RendererEvent,
    MarkdownEvent,
} from "./lib/output";
export type { RenderTemplate, RendererHooks } from "./lib/output";

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
    EntryPointStrategy,
    EventHooks,
} from "./lib/utils";

export type {
    OptionsReader,
    TypeDocOptions,
    TypeDocOptionMap,
    ValidationOptions,
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
    FlagsDeclarationOption,
    DeclarationOptionToOptionType,
    SortStrategy,
    ParameterTypeToOptionTypeMap,
    DocumentationEntryPoint,
} from "./lib/utils";

export type { EventMap, EventCallback } from "./lib/utils/events";

export {
    JSONOutput,
    Serializer,
    SerializerComponent,
    SerializeEvent,
} from "./lib/serialization";
export type { SerializeEventData } from "./lib/serialization";

import * as TypeScript from "typescript";
export { TypeScript };
