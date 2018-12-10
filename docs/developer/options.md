*Copied from https://gist.github.com/mootari/d39895574c8deacc57d0fc04eb0d21ca*
*Original author: https://github.com/mootari*

# Component options

Below is a list of all component classes (with their component names) that expose options.

Application (`application`, internal):
- `logger`
- `ignoreCompilerErrors`
- `exclude`

Converter (`converter`, internal):
- `name`
- `externalPattern`
- `includeDeclarations`
- `excludeExternals`
- `excludeNotExported`
- `excludePrivate`

BlockConverter (`node:block`):
- `mode`

GitHubPlugin (`git-hub`):
- `gitRevision`

PackagePlugin (`package`):
- `readme`

MarkedLinksPlugin (`marked-links`):
- `listInvalidSymbolLinks`

MarkedPlugin (`marked`):
- `includes`
- `media`

Renderer (`renderer`, internal):
- `theme`
- `disableOutputCheck`
- `gaID`
- `gaSite`
- `hideGenerator`
- `entryPoint`
- `toc`

TSConfigReader (`options:tsconfig`):
- `tsconfig`

TypedocReader (`options:typedoc`):
- `options`

PluginHost (`plugin-host`, internal):
- `plugin`
