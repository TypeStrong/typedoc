export { Application } from './lib/application';
export { CliApplication } from './lib/cli';
export * from './lib/stringifiers';

export { EventDispatcher, Event } from './lib/utils/events';
export { createMinimatch } from './lib/utils/paths';
export { resetReflectionID } from './lib/models/reflections/abstract';
export { normalizePath } from './lib/utils/fs';
export * from './lib/models/reflections';
export * from './lib/output/plugins';
export { Renderer } from './lib/output/renderer';
export { DefaultTheme, NavigationBuilder } from './lib/output/themes/DefaultTheme';
export { NavigationItem } from './lib/output/models/NavigationItem';
export { UrlMapping } from './lib/output/models/UrlMapping';

export {
    Option, // deprecated
    BindOption,
    Options,
    OptionsReader,
    ParameterHint,
    ParameterScope,
    ParameterType,

    TypeDocOptions,
    TypeDocAndTSOptions,
    TypeDocOptionMap,
    KeyToDeclaration,
    SourceFileMode,

    TSConfigReader,
    TypeDocReader,
    ArgumentsReader,

    DeclarationOption,

    DeclarationOptionBase,
    StringDeclarationOption,
    NumberDeclarationOption,
    BooleanDeclarationOption,
    ArrayDeclarationOption,
    MixedDeclarationOption,
    MapDeclarationOption,
    DeclarationOptionToOptionType
} from './lib/utils/options';

export { JSONOutput } from './lib/serialization';
