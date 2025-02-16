# Building the TypeDoc Example

1. Build TypeDoc: `pnpm install` and `pnpm build` in the root directory.
2. `cd example`
3. `pnpm install` (the example has its own `package.json`)
4. Typecheck the example: `pnpm tsc`
5. Build the docs: `pnpm typedoc`
