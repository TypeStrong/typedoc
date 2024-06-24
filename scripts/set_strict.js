// @ts-check
// Sets the Strict type that TypeDoc uses to enable overloads for consumers only.
// See the rationale in src/lib/utils/general.ts

import fs from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";

const file = join(
    fileURLToPath(import.meta.url),
    "../../src/lib/utils/general.ts",
);

const isStrict = process.argv[2] === "true";

fs.readFile(file, { encoding: "utf-8" })
    .then((text) =>
        fs.writeFile(
            file,
            text.replace(
                /type InternalOnly =.*/,
                `type InternalOnly = ${isStrict};`,
            ),
        ),
    )
    .catch((reason) => {
        console.error(reason);
        process.exit(1);
    });
