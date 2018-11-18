---
layout: 'guide'
title: 'Doc Comments'
menuOrder: 3
---

# Document your code

TypeDoc runs the TypeScript compiler and extracts type information from the generated compiler symbols.
Therefore you don't have to include additional metadata within your comments, TypeScript specific elements
like classes, enumerations or property types and access modifiers will be automatically detected.

All comments are parsed as markdown. TypeDoc uses the [Marked](<https://github.com/chjj/marked>) markdown parser
and [HighlightJS](<https://github.com/isagalaev/highlight.js>) to highlight code blocks within markdown sections.
Additionally you can link to other classes, members or functions using double square brackets.


## Supported tags

TypeDoc supports a specific set of tags. Many JSDoc tags are not supported because the TypeScript
compiler can infer the information directly from code. TypeDoc renders any unsupported tags in a
list in the documentation, so they are not lost.

The documentation generator currently understands the following doc comment tags:

### ```@param <param name>```
Documents a parameter for the subsequent method

### ```@return(s)```
Documents the return of the subsequent method

### ```@event```
Documents events triggered by the subsequent method

### ```@hidden and @ignore```
Keeps the subsequent code from being documented.


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


## Namespaces

Namespaces (previously referred to as "modules") can be commented like any other elements in TypeScript. As namespaces can be defined in multiple
files, TypeDoc selects the longest comment by default. One may override this behaviour with the special
`@preferred` comment tag.

```typescript
/**
 * Actual namespace comment.
 * @preferred
 */
namespace MyModule { }
```

```typescript
/**
 * Dismissed namespace comment.
 * This is the longer comment but will be dismissed in favor of the preferred comment.
 */
namespace MyModule { }
```


## Files

The first doc comment within a file is used as the doc comment of a file. However, you must
ensure that the first declaration also has as doc comment.

```typescript
/**
 * This is a doc comment for a file
 */

/**
 * This is a doc comment for "someVar".
 */
var someVar:string = "value";
```
