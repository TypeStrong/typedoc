export { Application } from "./lib/application";

export { EventDispatcher, Event } from "./lib/utils/events";
export { resetReflectionID } from "./lib/models/reflections/abstract";
export { normalizePath } from "./lib/utils/fs";
export * from "./lib/models";
export {
    Converter,
    Context,
    type CommentParserConfig,
    type DeclarationReference,
    type SymbolReference,
    type ComponentPath,
    type Meaning,
    type MeaningKeyword,
    type ExternalResolveResult,
    type ExternalSymbolResolver,
} from "./lib/converter";

export {
    Renderer,
    DefaultTheme,
    DefaultThemeRenderContext,
    UrlMapping,
    Theme,
    PageEvent,
    RendererEvent,
    MarkdownEvent,
    IndexEvent,
} from "./lib/output";
export type { RenderTemplate, RendererHooks } from "./lib/output";

export {
    ArgumentsReader,
    BindOption,
    CommentStyle,
    JSX,
    LogLevel,
    Logger,
    Options,
    PackageJsonReader,
    ParameterHint,
    ParameterType,
    TSConfigReader,
    TypeDocReader,
    EntryPointStrategy,
    EventHooks,
    MinimalSourceFile,
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
    ObjectDeclarationOption,
    MapDeclarationOption,
    FlagsDeclarationOption,
    DeclarationOptionToOptionType,
    SortStrategy,
    ParameterTypeToOptionTypeMap,
    DocumentationEntryPoint,
    ManuallyValidatedOption,
    EnumKeys,
} from "./lib/utils";

export type { EventMap, EventCallback } from "./lib/utils/events";

export {
    JSONOutput,
    Serializer,
    Deserializer,
    type Deserializable,
    type DeserializerComponent,
    type SerializerComponent,
    SerializeEvent,
} from "./lib/serialization";

import TypeScript from "typescript";
export { TypeScript };
