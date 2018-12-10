*Copied from https://gist.github.com/mootari/d39895574c8deacc57d0fc04eb0d21ca*
*Original author: https://github.com/mootari*

# Events

## Components

- `ComponentEvent.ADDED (event: ComponentEvent)`
- `ComponentEvent.REMOVED(event: ComponentEvent)`

## Options

- `DiscoverEvent.DISCOVER (event: DiscoverEvent)`

## Conversion

### General Events

- `Converter.EVENT_BEGIN (context: Context)`:
  Triggered when the converter begins converting a project.
- `Converter.EVENT_END (context: Context)`:
  Triggered when the converter has finished converting a project.

### Factory Events

- `Converter.EVENT_FILE_BEGIN (context: Context, project: ProjectReflection, node: TypeScript.SourceFile)`:
  Triggered when the converter begins converting a source file.
- `Converter.EVENT_CREATE_DECLARATION (context: Context, declaration: DeclarationReflection, node?: TypeScript.TypeReferenceNode)`:
  Triggered when the converter has created a declaration reflection.
- `Converter.EVENT_CREATE_SIGNATURE (context: Context, signature: SignatureReflection, node: TypeScript.SignatureDeclaration)`:
  Triggered when the converter has created a signature reflection.
- `Converter.EVENT_CREATE_PARAMETER (context: Context, parameter: ParameterReflection, node: TypeScript.ParameterDeclaration)`:
  Triggered when the converter has created a parameter reflection.
- `Converter.EVENT_CREATE_TYPE_PARAMETER (context: Context, typeParameter: TypeParameterReflection, node: TypeScript.TypeParameterDeclaration)`:
  Triggered when the converter has created a type parameter reflection.
- `Converter.EVENT_FUNCTION_IMPLEMENTATION (context: Context, method: DeclarationReflection, node: TypeScript.Node | TypeScript.FunctionDeclaration | TypeScript.MethodDeclaration)`:
  Triggered when the converter has found a function implementation.

### Resolve Events

- `Converter.EVENT_RESOLVE_BEGIN (context: Context)`:
  Triggered when the converter begins resolving a project.
- `Converter.EVENT_RESOLVE (context: Context, reflection: Reflection)`:
  Triggered when the converter resolves a reflection.
- `Converter.EVENT_RESOLVE_END (context: Context)`:
  Triggered when the converter has finished resolving a project.

## Output

### Rendering

While a project is being processed Renderer triggers a series of events. These can be listened to in order to control the flow or manipulate the output.

- `RendererEvent.BEGIN (event: RenderEvent)`:
  Triggered before the renderer starts rendering a project. By calling event.preventDefault the entire render process can be canceled.
- `PageEvent.BEGIN (page: PageEvent)`:
  Triggered before a document will be rendered.
- `PageEvent.END (page: PageEvent)`:
  Triggered after a document has been rendered, just before it is written to disc.
- `RendererEvent.END (event: RenderEvent)`:
  Triggered after the renderer has written all documents.

### Plugins

- `MarkdownEvent.PARSE (event: MarkdownEvent)`:
  Triggered on the renderer when this plugin parses a markdown string.

## Serialization

Todo. See lib/serialization/serializer.ts
