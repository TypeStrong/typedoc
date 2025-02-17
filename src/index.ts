/**
 * @module TypeDoc API
 *
 * In addition to the members documented here, TypeDoc exports a `typedoc/debug`
 * entry point which exports some functions which may be useful during plugin
 * development or debugging. Exports from that entry point are **not stable**
 * and may change or be removed at any time.
 */
export { Application, type ApplicationEvents } from "./lib/application.js";

export { resetReflectionID } from "./lib/models/reflections/abstract.js";
/**
 * All symbols documented under the Models namespace are also available in the root import.
 * @primaryExport
 *
 * @categoryDescription Types
 * Describes a TypeScript type.
 *
 * @categoryDescription Reflections
 * Describes a documentation entry. The root entry is a {@link ProjectReflection}
 * and contains {@link DeclarationReflection} instances.
 *
 * @summary
 * TypeDoc converts source code into these object types.
 */
export * as Models from "./lib/models/index.js";
/**
 * All symbols documented under the Configuration namespace are also available in the root import.
 * @summary
 * Controls how TypeDoc reads option files and what options are available.
 */
export {
    type CommentParserConfig,
    Context,
    Converter,
    type ConverterEvents,
    type ExternalResolveResult,
    type ExternalSymbolResolver,
} from "./lib/converter/index.js";
export * from "./lib/models/index.js";
/** @primaryExport */
export * as Configuration from "./lib/utils/options/index.js";

export {
    BaseRouter,
    CategoryRouter,
    DefaultTheme,
    DefaultThemeRenderContext,
    GroupRouter,
    IndexEvent,
    KindDirRouter,
    KindRouter,
    MarkdownEvent,
    PageEvent,
    PageKind,
    Renderer,
    RendererEvent,
    Slugger,
    StructureDirRouter,
    StructureRouter,
    Theme,
    UrlMapping,
} from "./lib/output/index.js";
export type {
    Icons,
    NavigationElement,
    PageDefinition,
    PageHeading,
    RendererEvents,
    RendererHooks,
    RenderTemplate,
    Router,
} from "./lib/output/index.js";

export { Outputs } from "./lib/output/output.js";

export {
    ArgumentsReader,
    CommentStyle,
    EntryPointStrategy,
    Logger,
    LogLevel,
    MinimalSourceFile,
    normalizePath,
    Option,
    OptionDefaults,
    Options,
    PackageJsonReader,
    ParameterHint,
    ParameterType,
    TSConfigReader,
    TypeDocReader,
} from "./lib/utils/index.js";

export type {
    ArrayDeclarationOption,
    BooleanDeclarationOption,
    DeclarationOption,
    DeclarationOptionBase,
    DeclarationOptionToOptionType,
    DocumentationEntryPoint,
    FlagsDeclarationOption,
    JsDocCompatibility,
    KeyToDeclaration,
    ManuallyValidatedOption,
    MapDeclarationOption,
    MixedDeclarationOption,
    NumberDeclarationOption,
    ObjectDeclarationOption,
    OptionsReader,
    OutputSpecification,
    ParameterTypeToOptionTypeMap,
    SortStrategy,
    StringDeclarationOption,
    TypeDocOptionMap,
    TypeDocOptions,
    TypeDocOptionValues,
    ValidationOptions,
} from "./lib/utils/index.js";

export {
    type ComponentPath,
    type DeclarationReference,
    type EnumKeys,
    EventDispatcher,
    EventHooks,
    type GlobString,
    JSX,
    type Meaning,
    type MeaningKeyword,
    type NormalizedPath,
    type NormalizedPathOrModule,
    type SymbolReference,
} from "#utils";

export {
    type Deserializable,
    Deserializer,
    type DeserializerComponent,
    JSONOutput,
    SerializeEvent,
    Serializer,
    type SerializerComponent,
    type SerializerEvents,
} from "./lib/serialization/index.js";

export * as Internationalization from "./lib/internationalization/index.js";
// Re-exported here so that declaration merging works as expected
export type { TranslatableStrings } from "./lib/internationalization/internationalization.js";

import TypeScript from "typescript";
export { TypeScript };
