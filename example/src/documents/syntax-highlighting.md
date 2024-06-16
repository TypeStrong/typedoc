---
title: Syntax Highlighting
category: Documents
---

TypeDoc supports code blocks in Markdown and uses
[Shiki](https://shiki.matsu.io/) to provide syntax highlighting.

TypeDoc supports all languages supported by Shiki, but does not load all of
them by default. The `highlightLanguages` option can be used to customize
which languages are loaded for highlighting.

If no language is specified, the code block is assumed to be TypeScript:

```
// A fabulous variable
const x: number | string = 12
```

You can specify the language at the start of your code block like this:

````text
```rust
````

Use the `tsx` language to get JSX support:

```tsx
function BasicComponent(): ReactElement {
    return <div>Test</div>;
}
```

You might want to write code in the language your backend uses. Here's some
Python:

```python
for i in range(30):
    print(i + 1)
```

And some CSS:

```css
.card {
    background-color: white;
    padding: 1rem;
    border: 1px solid lightgray;
}
```

If you don't want syntax highlighting, use the `text` language:

```text
package.json
src/
    index.ts
    __tests__/
        index.test.ts
```

[**View the full list of supported
languages.**](https://github.com/shikijs/shiki/blob/main/docs/languages.md#all-languages)
You can also get this list by running `typedoc --help`.
