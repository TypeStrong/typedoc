---
title: Declaration References
---

# Declaration References

> [!note] If [--useTsLinkResolution](options/comments.md#usetslinkresolution) is turned on (the default) this page
> likely **does not apply** for your links within comments (though it will be used for
> [external documents](./external-documents.md) and for the readme file). Declaration references are used only if that option is
> off or TypeScript fails to resolve a link.

Some tags like [`{@link}`](tags/link.md) and [`{@inheritDoc}`](tags/inheritDoc.md) can refer to other
members of the documentation. These tags use declaration references to name another declaration.

TypeDoc's declaration references are slightly different than JSDoc's namepaths. They are based off of
the "new" [TSDoc](https://tsdoc.org/pages/spec/overview/) declaration references with slight modifications
to make their resolution behavior more closely match the TypeScript language service (e.g. what VSCode does).

Declaration references are comprised of an optional module source, a component path, and an optional meaning.

## Module Source

The first part of a declaration, up to a `!` is parsed as the module source. This will be taken
literally and used to refer to the module name in a multiple entry point documentation site.
It should _not_ include the path to the module file.

If a declaration reference does not contain a `!`, then it does not contain a module source, and the
first part of the declaration reference is the component path.

```ts
/**
 * {@link moduleA!}
 * {@link "with!bang and \"quoted path\""!}
 */
```

## Component Path

After the module source, declaration references contain a component path, which is made up of one
or more component names delimitated by a `.`, `#`, or `~`.

The deliminator is used to determine how to navigate the project tree.

<!-- dprint-ignore -->
| Deliminator | Behavior |
| --- | --- |
| `.` | The most general purpose deliminator. It will first try to resolve exports and static class properties, but will also resolve members if no export is found for improved compatibility with TypeScript's resolution. |
| `#` | Indicates that the next component is a "member", including class instance properties, interface members, and enum members. |
| `~` | Indicates that the next component is an export of a namespace/module. |

> [!warning] The TSDoc specification says that `~` traverses via locals. This is
> different than TypeDoc's behavior. TypeDoc will treat `~` as a stricter `.`
> which only supports navigating to a namespace/module export. It should
> generally be avoided in favor of `.` for improved compatibility with VSCode.

```ts
// module.ts
/**
 * {@link module!Foo}
 * {@link Foo}
 */
export namespace Foo {
    /**
     * {@link module!Foo.Bar}
     * {@link module!Foo~Bar}
     * {@link Foo~Bar}
     */
    export namespace Bar {
        /**
         * {@link module!Foo.Bar.Baz}
         * {@link module!Foo~Bar~Baz}
         * {@link Bar~Baz}
         * {@link Baz}
         */
        export class Baz {
            /**
             * {@link Baz#prop}
             */
            prop = 123;
            /**
             * {@link Baz.prop}
             */
            static prop = 456;

            /**
             * {@link Baz#instanceOnly}
             * {@link Baz.instanceOnly} also works as there is no conflicting static
             */
            instanceOnly = 789;
        }
    }
}
```

### Reference Scope

If no module source is specified, by default component paths are resolved relative to the scope where
they are declared (note: Modules and namespaces create a new scope. Classes, interfaces, and object types
do not). This is sometimes inconvenient if a name is shadowed. To refer to a name with resolution starting
in the the root scope, an empty module source can be specified with `!`.

```ts
export const Target = 1;
export namespace Foo {
    export const Target = 2;

    /**
     * {@link Target} links to 2
     * {@link !Target} links to 1
     */
    export const Source = 3;
}
```

While classes and interfaces do not normally create a new scope, the TypeScript language service will
check their members for link targets when resolving links starting at the class/interface declaration.
TypeDoc mimics this behavior, but be aware that links that do not contain the class/interface name
will prefer targets in their normal scope.

```ts
export const dup = 1;
/**
 * {@link dup} links to 1
 * {@link target} links to 2
 * {@link Foo.dup} links to 3
 */
export class Foo {
    target = 2;
    dup = 3;
}
```

## Meaning

The final part of a declaration reference is an optional meaning which can be used to disambiguate
references which could otherwise refer to multiple documentation items. The meaning can also be used
to refer to a specific overload or type of declaration.

The meaning takes one of the following forms:

- `:keyword` where `keyword` is described by the list below.
- `:keyword(decimal digits)` where `decimal digits` indicates the index of an overloaded meaning
- `:(decimal digits)` shorthand for an overloaded meaning
- `:decimal digits` shorthand for an overloaded meaning
- `:label` where `label` refers to a declaration by its
  [`{@label}`](./tags/label.md) tag. `label` may contain `A-Z`, `0-9`, and `_`
  and may not start with a number. Note: This meaning parse is specific to
  TypeDoc, and is not currently specified by the TSDoc standard.

The keywords recognized by TypeDoc are:

- `class` - Refers to reflections which represent a class.
- `interface` - Refers to reflections which represent an interface.
- `type` - Refers to reflections which represent some type.
- `enum` - Refers to reflections which represent an enum.
- `namespace` - Refers to reflections which represent a namespace.
- `function` - Refers to reflections which represent a function's or method's signatures.
- `var` - Refers to reflections which represent a variable.
- `constructor` - Refers to the constructor of a class or type.
- `member` - Refers to reflections which represent an enum member, property, method, or accessor.
- `event` - Permitted to conform with the TSDoc spec, but will result in a broken reference.
- `call` - Refers to reflections which represent a function's or method's signatures.
- `new` - Refers to the constructor of a class or type.
- `index` - Refers to a reflection's index signatures.
- `complex` - Refers to reflections which represent some type.
- `getter` - (TypeDoc specific, 0.23.3+) Refers to the get signature of an accessor.
- `setter` - (TypeDoc specific, 0.23.3+) Refers to the set signature of an accessor.

```ts
/**
 * {@link foo:0}
 * {@link foo:function}
 * {@link foo:(0)}
 * {@link foo:function(0)}
 * {@link foo:NO_ARGS}
 * {@label NO_ARGS}
 */
function foo(): void;
/**
 * {@link foo:1}
 * {@link foo:function(1)}
 * {@link foo:(1)}
 * {@link foo:NUM_ARG}
 * {@label NUM_ARG}
 */
function foo(n: number): number;
/**
 * {@link foo:2}
 * {@link foo:function(2)}
 * {@link foo:(2)}
 * {@link foo:STR_ARG}
 * {@label STR_ARG}
 */
function foo(s: string): string;
```
