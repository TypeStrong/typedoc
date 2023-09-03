export { Application } from "./lib/application";

export { EventDispatcher, Event } from "./lib/utils/events";
export { resetReflectionID } from "./lib/models/reflections/abstract";
/**
 * All symbols documented under the Models namespace are also available in the root import.
 */
export * as Models from "./lib/models";
/**
 * All symbols documented under the Configuration namespace are also available in the root import.
 */
export * as Configuration from "./lib/utils/options";
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
    Option,
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
    normalizePath,
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
    JsDocCompatibility,
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
