# Components and Events

TypeDoc uses a `Component` and `Event`-based architecture.

## `Component`

`Component`s can have child `Component`s.
Each child gets a name; a component cannot have 2x children with the same name.

`Component` has methods / fields:
`componentName` set by decorator metadata
`addComponent(name, ComponentClass)` responsible for instantiating the component
`trigger()`
`bubble()` like trigger, but after trigger also calls on parent component.

`Component` subclasses are annotated with a decorator.
if not marked `internal` and if is a subclass of another component's childClass,
then becomes registered as a `_defaultComponent`

Components are slowly being removed from TypeDoc.

## `Event`

`Event`s can be fired.

`Event` has methods:
`isPropagationStopped`
`isDefaultPrevented`

## `@BindOption`

`@BindOption` decorator can be placed on any class which has `application` or `options` fields.
It turns the field into a getter which gets the value from `this.options` or `this.application.options`
