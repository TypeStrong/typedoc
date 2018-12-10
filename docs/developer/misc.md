

The event system allows plugins to react to different events (see src/lib/converter/plugins).

A lot of the component hierarchy is to allow instanceof checks.

ComponentHost is just an interface saying that the component has access to the application instance.

AbstractComponent sets up some basic event dispatching and initializing semantics.

ChildableComponent is the base for creating wrapper components that can have components added to it and is used for TypeDoc's major components like the converter and renderer.

Some of the base component classes are defined in src/lib/utils/component.ts and src/lib/converter/components.ts.
