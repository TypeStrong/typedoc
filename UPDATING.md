
## Updating
TypeDoc uses internal TypeScript compiler APIs. Since internal APIs can be changed by a minor
release, TypeDoc must target exact TypeScript compiler versions. If your project is using a newer
version of TypeScript than TypeDoc, but does not rely on features from the latest version, you
may be able to get away with using a version of TypeDoc that targets a lower TypeScript version.

If you need the latest version and one hasn't yet been published then these are the steps
you should follow to build your own.

```bash
# Checkout a copy of TypeDoc if you don't have one already
git clone https://github.com/TypeStrong/typedoc
cd typedoc

# Change the version of TypeScript used by the project
editor package.json

npm install # install TypeDoc's dependencies

# Build and run the automated TypeDoc tests
npm run build_and_test
```

Once this has been done, you should have a functional version of TypeDoc for
your version of TypeScript. Please open a Pull Request with your updated project
so that others may benefit from the update.

To use your version of TypeDoc in a project, point your `package.json`
file at it using your GitHub project path.

```json
{
    "dependencies": {
        "typedoc": "mygithubuser/typedoc#v1.8.10"
    }
}
```
