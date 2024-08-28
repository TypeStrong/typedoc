/**
 * @module TypeDoc API
 */
export { Application, type ApplicationEvents } from "./lib/application.js";

export { EventDispatcher } from "./lib/utils/events.js";
export { resetReflectionID } from "./lib/models/reflections/abstract.js";
/**
 * All symbols documented under the Models namespace are also available in the root import.
 *
 * @categoryDescription Types
 * Describes a TypeScript type.
 *
 * @categoryDescription Reflections
 * Describes a documentation entry. The root entry is a {@link ProjectReflection}
 * and contains {@link DeclarationReflection} instances.
 */
export * as Models from "./lib/models/index.js";
/**
 * All symbols documented under the Configuration namespace are also available in the root import.
 */
export * as Configuration from "./lib/utils/options/index.js";
export * from "./lib/models/index.js";
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
    type ConverterEvents,
} from "./lib/converter/index.js";

export {
    Renderer,
    DefaultTheme,
    DefaultThemeRenderContext,
    Slugger,
    UrlMapping,
    Theme,
    PageEvent,
    RendererEvent,
    MarkdownEvent,
    IndexEvent,
} from "./lib/output/index.js";
export type {
    RenderTemplate,
    RendererHooks,
    NavigationElement,
    RendererEvents,
    PageHeading,
} from "./lib/output/index.js";

export {
    ArgumentsReader,
    Option,
    CommentStyle,
    JSX,
    LogLevel,
    Logger,
    Options,
    OptionDefaults,
    PackageJsonReader,
    ParameterHint,
    ParameterType,
    TSConfigReader,
    TypeDocReader,
    EntryPointStrategy,
    EventHooks,
    MinimalSourceFile,
    normalizePath,
} from "./lib/utils/index.js";

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
} from "./lib/utils/index.js";

export {
    JSONOutput,
    Serializer,
    type SerializerEvents,
    Deserializer,
    type Deserializable,
    type DeserializerComponent,
    type SerializerComponent,
    SerializeEvent,
} from "./lib/serialization/index.js";

export * as Internationalization from "./lib/internationalization/index.js";

import TypeScript from "typescript";
export { TypeScript };
