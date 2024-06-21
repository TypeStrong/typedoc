---
title: Components and Events
---

# Components and Events

TypeDoc uses a `Component` and `Event`-based architecture.

## `Component`

`Component`s can have child `Component`s.
Each child gets a name; a component cannot have multiple children with the same name.

`Component` has methods / fields:
`componentName` set by decorator metadata
`trigger()`

`Component` subclasses are annotated with a decorator.
if not marked `internal` and if is a subclass of another component's childClass,
then becomes registered as a `_defaultComponent`

This component-decorator hierarchy is slowly being removed from TypeDoc.

## `@Option`

`@Option` decorator can be placed on any class which has `application` or `options` accessor.
It turns the accessor into a getter which gets the value from `this.options` or `this.application.options`
