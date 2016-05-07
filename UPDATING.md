
## Updating
TypeDoc makes use of internal API methods from the TypeScript compiler - as such you will need
to recompile it for each and every different TypeScript compiler release. If your project doesn't
rely on features from the latest TypeScript compiler, you may be able to get away with using
version of TypeDoc which doesn't target it.

If, however, you need the latest version and one hasn't yet been published then these are the steps
you should follow to build your own.

```bash
# Checkout a copy of TypeDoc if you don't have one already
git clone https://github.com/TypeStrong/typedoc typedoc
cd typedoc

# Change the version of TypeScript used by the project
editor package.json

npm install -g grunt-cli # install grunt's CLI globally if you don't have it
npm install # install TypeDoc's dependencies

# Checkout the version of TypeScript you are targetting
git clone https://github.com/Microsoft/TypeScript typescript
cd typescript
git checkout v1.8.10 # checkout the correct version (as set in package.json)
npm install -g jake # install the jake build tool globally if you don't have it
npm install # install TypeScript's build dependencies
jake local # build TypeScript
cd ../

# Setup TypeDoc for your TypeScript version
grunt ts:typescript # compile the internal-API typescript definition files
grunt string-replace:typescript # format the internal-API typescript files

# Build and run the automated TypeDoc tests
grunt build_and_test 

# Do a visual inspection to make sure that modules were generated correctly
ls test/render/specs/modules
```

Once this has been done, you should have a functional version of TypeDoc for
your version of TypeScript. If you're so inclined, please open a Pull Request
with your updated project so that others may benefit from the update.

To make use of your version of TypeDoc in a project, point your `package.json`
file at it using your GitHub project path.

```json
{
    "dependencies": {
        "typedoc": "mygithubuser/typedoc#v1.8.10"
    }
}
```