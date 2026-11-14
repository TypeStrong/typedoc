// typescript-eslint uses the in-process TypeScript API, which TypeScript 7 does not have, and
// it does not support TypeScript 7. TypeDoc depends on TypeScript 7, so give the typescript-eslint
// packages their own TypeScript 6 instead of the one which they would get as a peer.
const TYPESCRIPT_FOR_LINTING = "6.0.3";

module.exports = {
    hooks: {
        readPackage(pkg) {
            if (pkg.name === "typescript-eslint" || pkg.name.startsWith("@typescript-eslint/")) {
                if (pkg.peerDependencies?.typescript) {
                    delete pkg.peerDependencies.typescript;
                    pkg.dependencies = { ...pkg.dependencies, typescript: TYPESCRIPT_FOR_LINTING };
                }
            }
            return pkg;
        },
    },
};
