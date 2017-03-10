---
layout: 'guide'
title: 'DocComments'
menuOrder: 4
---

# Document your code

TypeDoc runs the TypeScript compiler and extracts type information from the generated compiler symbols.
Therefore you don't have to include additional metadata within your comments, TypeScript specific elements
like classes, enumerations or property types and access modifiers will be automatically detected.

All comments are parsed as markdown. TypeDoc uses the Marked (https://github.com/chjj/marked) markdown parser
and HighlightJS (https://github.com/isagalaev/highlight.js) to highlight code blocks within markdown sections.
Additionally you can link to other classes, members or functions using double square brackets.


## JavaDoc tags

The documentation generator currently understands these javadoc tags:

 * ```@param <param name>```
 * ```@return(s)```

All other tags will be rendered as definition lists, so they are not lost.


## Function signatures

When writing documentation for function signatures, you don't have to repeat yourself. TypeDoc automatically
copies comments and tags of the function implementation to its signatures for you. Of course you can still
overwrite them if you wish to.

```typescript
/**
 * @param text  Comment for parameter ´text´.
 */
function doSomething(target:any, text:string):number;

/**
 * @param value  Comment for parameter ´value´.
 * @returns      Comment for special return value.
 */
function doSomething(target:any, value:number):number;

/**
 * Comment for method ´doSomething´.
 * @param target  Comment for parameter ´target´.
 * @returns       Comment for return value.
 */
function doSomething(target:any, arg:any):number {
    return 0;
}
```


## Modules

Modules can be commented like any other elements in TypeScript. As modules can be defined in multiple
files, TypeDoc selects the longest comment by default. One may override this behaviour with the special
`@preferred` comment tag.

```typescript
/**
 * Actual module comment.
 * @preferred
 */
module MyModule { }
```

```typescript
/**
 * Dismissed module comment.
 * This is the longer comment but will be dismissed in favor of the preferred comment.
 */
module MyModule { }
```


## Dynamic modules

The first doc comment within a file is used as the doc comment of a dynamic module. However, you must
ensure that the first declaration also has as doc comment.

```typescript
/**
 * This is a doc comment for a dynamic module.
 */

/**
 * This is a doc comment for "someVar".
 */
var someVar:string = "value";
```
