/**
 * @module TypeDoc API
 *
 * In addition to the members documented here, TypeDoc exports a `typedoc/debug`
 * entry point which exports some functions which may be useful during plugin
 * development or debugging. Exports from that entry point are **not stable**
 * and may change or be removed at any time.
 *
 * TypeDoc also exports a `typedoc/browser` entry point which exports a subset
 * of the members described here which makes it suitable for usage in browser
 * bundles which want to use TypeDoc's JSON output in the browser.
 */
export { Application, type ApplicationEvents } from "./application.js";

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
export * from "#models";
export * as Models from "#models";
export {
    type CommentParserConfig,
    Context,
    Converter,
    type ConverterEvents,
    type ExternalResolveResult,
    type ExternalSymbolResolver,
    RepositoryManager,
} from "./converter/index.js";

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
} from "./output/index.js";
export type {
    Icons,
    NavigationElement,
    PageDefinition,
    PageHeading,
    RendererEvents,
    RendererHooks,
    RenderTemplate,
    Router,
    RouterTarget,
} from "./output/index.js";

export { Outputs } from "./output/output.js";

export {
    /**
     * All symbols documented under the Configuration namespace are also available in the root import.
     * @summary
     * Controls how TypeDoc reads option files and what options are available.
     */
    Configuration,
    EntryPointStrategy,
    normalizePath,
    ValidatingFileRegistry,
} from "#node-utils";

export {
    ArgumentsReader,
    type ArrayDeclarationOption,
    type BooleanDeclarationOption,
    CommentStyle,
    type DeclarationOption,
    type DeclarationOptionBase,
    type DeclarationOptionToOptionType,
    type FlagsDeclarationOption,
    type JsDocCompatibility,
    type KeyToDeclaration,
    type ManuallyValidatedOption,
    type MapDeclarationOption,
    type MixedDeclarationOption,
    type NumberDeclarationOption,
    type ObjectDeclarationOption,
    Option,
    OptionDefaults,
    Options,
    type OptionsReader,
    type OutputSpecification,
    PackageJsonReader,
    ParameterHint,
    ParameterType,
    type StringDeclarationOption,
    TSConfigReader,
    type TypeDocOptionMap,
    type TypeDocOptions,
    type TypeDocOptionValues,
    TypeDocReader,
    type ValidationOptions,
} from "#node-utils";

export type { DocumentationEntryPoint, FancyConsoleLogger, SortStrategy } from "#node-utils";

export {
    type ComponentPath,
    ConsoleLogger,
    type DeclarationReference,
    type EnumKeys,
    EventDispatcher,
    EventHooks,
    type GlobString,
    i18n,
    JSX,
    Logger,
    LogLevel,
    type Meaning,
    type MeaningKeyword,
    type MinimalNode,
    MinimalSourceFile,
    type NormalizedPath,
    type NormalizedPathOrModule,
    type NormalizedPathOrModuleOrFunction,
    type SymbolReference,
    type TagString,
    type TranslatedString,
    translateTagName,
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
} from "#serialization";

export * as Internationalization from "./internationalization/index.js";
// Re-exported here so that declaration merging works as expected
export type { TranslatableStrings } from "./internationalization/internationalization.js";
export { TypeScript };

import TypeScript from "typescript";
