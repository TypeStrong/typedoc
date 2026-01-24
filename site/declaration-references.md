---
title: Declaration References
---

# Declaration References

> [!note] If [--useTsLinkResolution](options/comments.md#usetslinkresolution) is turned on (the default) this page
> **may not apply** for your links within comments as TypeDoc will use TypeScript's resolution if TypeScript resolved
> the link. This resolution strategy will only be used if TypeScript fails to parse the link or does not parse the
> source document (e.g. for [external documents](./external-documents.md) and for the readme file).

Some tags like [`{@link}`](tags/link.md) and [`{@inheritDoc}`](tags/inheritDoc.md) can refer to other
members of the documentation. These tags use declaration references to name another declaration.

TypeDoc's declaration references are slightly different than JSDoc's namepaths. They are based off of
the "new" [TSDoc](https://tsdoc.org/pages/spec/overview/) declaration references with slight modifications
to make their resolution behavior more closely match the TypeScript language service (e.g. what VSCode does).

Declaration references are comprised of an optional module source, a component path, and an optional meaning.
Once parsed, they are resolved according to the [resolution strategy](#resolution-strategy) described below.

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

# Resolution Strategy

When resolving links TypeDoc resolves the module source, then the component path, and finally the meaning.

Link resolution is most easily understood with an example, the following project structure will be used in
examples below:

```text
project "My lib docs"
    module "@me/lib"
        class "Foo"
            static property "bar"
            property "bar"
            method "baz"
                signature 0 () => string
                signature 1 (x: number) => number

        type alias "Bam"
        function "Bam"
            signature 0 () => string
            signature 1 (x: number) => number

        namespace "Nested"
            variable "Bam"

    module "@me/lib2"
        function "Bop"
```

1. Resolve the Module Source:

   TypeDoc first checks if a module is specified before `!`. If a module source is specified, then TypeDoc
   will get the root level reflection with the same name as the module. In the example above, `@me/lib!`
   and `@me/lib2!` will be resolved to the expected module, but `@me/fake!` will fail to resolve.

   If the declaration reference does not specify a module source but starts with `!` then the link is treated
   as a globally specified link whose resolution starts at the project level. `!"@me/lib"` will also resolve
   to that module.

   Otherwise, the link is treated as a local link which should start resolution at the comment location.
   TypeDoc will prioritize link resolution with fewer scope steps to the target, but will also check parents
   of a reflection for the link target. That is, `{@link Bam}` within the `Nested` namespace will resolve
   to `@me/lib.Nested.Bam`, but `{@link Bam}` in the `Foo` class's comment (or the property/method) will
   resolve to `@me/lib.Bam`.

2. Resolve the Component Path:

   Component paths are resolved according to their delimiter. The first section of a component path
   is resolved as if the delimiter is `.`.

   If the delimiter is `.`, TypeDoc will look for children of the current reflection, prioritizing
   exports and static attributes over member attributes. The link `{@link @my/lib!Foo.bar}` will link
   to the static property rather than the instance property, but `{@link my/lib!Foo.baz}` will successfully
   link to the method even though it isn't static.

   If the delimiter is `#`, TypeDoc will look for class/interface instance members. The link
   `{@link @my/lib!Foo.bar}` will link to the instance property.

   If the delimiter is `~`, TypeDoc will only look for children of the current reflection if the
   current reflection is a module. This delimiter isn't generally useful.

3. Resolve the Meaning:

   Meanings are used to disambiguate links which could be intended to go to multiple locations.
   The keyword portion of the meaning is resolved first. `{@link @my/lib!Bam:type}` will link
   to the type alias, while `{@link @my/lib!Bam:function}` will link to the function.

   Meanings may also include an index which further disambiguates the link. If you wanted to link
   to the second signature of the `Bam` function, `{@link @my/lib!Bam:function}` is insufficient
   and `{@link @my/lib!Bam:function(1)}` must be used instead.

   An index may be included in a meaning without the keyword. This would be sufficient for linking
   to the first signature of the `baz` method: `{@link @my/lib!Foo.baz:0}`, but the `Bam` function
   is also merged with a type alias, so `{@link @my/lib!Bam:0}` could link to either the type alias
   or the first signature of the function.
