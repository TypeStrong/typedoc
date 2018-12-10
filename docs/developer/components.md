*Copied from https://gist.github.com/mootari/d39895574c8deacc57d0fc04eb0d21ca*
*Original author: https://github.com/mootari*

# Components

## Instantiation

Components that extend from ChildableComponent may specify a childClass. Any included/required component extending from that class will automatically be added to the parent component's _defaultComponents and instantiated along with its parent. This behavior is provided by the Component decorator.


## Converter Components

All default converter components extend from ConverterComponent. When the `converter` component is instantiated any converter component that has been required at this point will be added to it.

### Node Converters

A node converter receives a TypeScript Declaration and returns a TypeDoc Reflection model. Node converter components extend from ConverterNodeComponent.

Components:
- `node:accessor` (AccessorConverter)
- `node:alias` (AliasConverter)
- `node:block` (BlockConverter)
- `node:class` (ClassConverter)
- `node:constructor` (ConstructorConverter)
- `node:enum` (EnumConverter)
- `node:export` (ExportConverter)
- `node:function` (FunctionConverter)
- `node:interface` (InterfaceConverter)
- `node:literal-object` (ObjectLiteralConverter)
- `node:literal-type` (TypeLiteralConverter)
- `node:module` (ModuleConverter)
- `node:signature-call` (SignatureConverter)
- `node:signature-index` (IndexSignatureConverter)
- `node:variable-statement` (VariableStatementConverter)
- `node:variable` (VariableConverter)

### Type Converters

A type converter receives a TypeScript Type and returns a TypeDoc Type model. Type converter components extend from ConverterTypeComponent.

Components:
- `type:alias` (AliasConverter)
- `type:array` (ArrayConverter)
- `type:binding-array` (BindingArrayConverter)
- `type:binding-object` (BindingObjectConverter)
- `type:enum` (EnumConverter)
- `type:intrinsic` (IntrinsicConverter)
- `type:reference` (ReferenceConverter)
- `type:string-literal` (StringLiteralConverter)
- `type:this` (ThisConverter)
- `type:tuple` (TupleConverter)
- `type:type-operator` (TypeOperatorConverter)
- `type:type-parameter` (TypeParameterConverter)
- `type:union-or-intersection` (UnionOrIntersectionConverter)
- `type:unknown` (UnknownConverter)

### Converter Plugins

Converter plugins perform various specialized tasks.

Components:
- `category` (CategoryPlugin):
  Sorts and categorizes the found reflections in the resolving phase, sets the ´category´ property of all reflections.
- `comment` (CommentPlugin):
  Parses javadoc comments and attaches Comment model instances to the generated reflections.
- `decorator` (DecoratorPlugin):
  Detects decorators.
- `deep-comment` (DeepCommentPlugin):
  Moves comments with dot syntax to their target.
- `dynamic-module` (DynamicModulePlugin):
  Truncates the names of dynamic modules to not include the project's base path.
- `git-hub` (GitHubPlugin):
  Watches for repositories with GitHub origin and links their source files to the related GitHub pages.
- `group` (GroupPlugin):
  Sorts and groups the found reflections in the resolving phase, sets the ´groups´ property of all reflections.
- `implements` (ImplementsPlugin):
  Detects interface implementations of functions and properties on classes and links them.
- `package` (PackagePlugin):
  Tries to find the package.json and readme.md files of the current project by traversing the file tree upwards, appends the contents to the ProjectReflection.
- `source` (SourcePlugin):
  Attaches source file information to reflections.
- `type` (TypePlugin):
  Converts all instances of LateResolvingType to their renderable equivalents.


## Renderer Components

All default renderer components extend from RendererComponent. When the `renderer` component is instantiated any renderer component that has been required at this point will be added to it.

Components:
- `assets` (AssetsPlugin):
  Copies the subdirectory ´assets´ from the current themes source folder to the output directory.
- `javascript-index` (JavascriptIndexPlugin):
  Exports an index of the project to a javascript file that can be used to build a simple search function.
- `layout` (LayoutPlugin):
  Wraps the generated output with the default layout template.
- `marked-links` (MarkedLinksPlugin):
  Builds links in markdown texts.
- `marked` (MarkedPlugin):
  Exposes the markdown, compact and relativeURL helper to handlebars.
- `navigation` (NavigationPlugin):
  Exposes the navigation structure of the documentation to the rendered templates.
- `pretty-print` (PrettyPrintPlugin):
  Reformats the generated HTML, reducing the output size by about a third.
- `toc` (TocPlugin):
  Generates a table of contents for the current page (starting at the nearest module) and stores it in the PageEvent.


## Serializers

Serializers receive various types of data and return a JSON object.

Components:
- `serializer:comment-tag` (CommentTagSerializer)
- `serializer:comment` (CommentSerializer)
- `serializer:decorator-container` (DecoratorContainerSerializer)
- `serializer:reflection-group` (ReflectionGroupSerializer)
- `serializer:reflection` (ReflectionSerializer)
- `serializer:container-reflection` (ContainerReflectionSerializer)
- `serializer:declaration-reflection` (DeclarationReflectionSerializer)
- `serializer:parameter-reflection` (ParameterReflectionSerializer)
- `serializer:project-reflection` (ProjectReflectionSerializer)
- `serializer:signature-reflection` (SignatureReflectionSerializer)
- `serializer:type-parameter-reflection` (TypeParameterReflectionSerializer)
- `serializer:source-reference-container` (SourceReferenceContainerSerializer)
- `serializer:type` (TypeSerializer)
- `serializer:array-type` (ArrayTypeSerializer)
- `serializer:intersection-type` (IntersectionTypeSerializer)
- `serializer:intrinsic-type` (IntrinsicTypeSerializer)
- `serializer:reference-type` (ReferenceTypeSerializer)
- `serializer:reflection-type` (ReflectionTypeSerializer)
- `serializer:string-literal-type` (StringLiteralTypeSerializer)
- `serializer:tuple-type` (TupleTypeSerializer)
- `serializer:type-operator-type` (TypeOperatorTypeSerializer)
- `serializer:type-parameter-type` (TypeParameterTypeSerializer)
- `serializer:unknown-type` (UnknownTypeSerializer)


## Option Readers

Components:
- `options:tsconfig` (TSConfigReader)
- `options:arguments` (ArgumentsReader)
- `options:typedoc` (TypedocReader)
- `options:component` (ComponentSource)
- `options:typescript` (TypeScriptSource)
