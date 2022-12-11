import type { Logger } from "./loggers";
import * as fs from "fs";
import { basename, dirname, extname, join, posix, relative } from "path";
import { nicePath } from "./paths";
import { validate } from "./validation";
import { getCommonDirectory, normalizePath } from "./fs";
import type { Options } from "./index";

export interface LazyDocumentationEntryPoint {
    packageName: string;
    version?: string;

    readmeFile?: string;
    entryPoints: { name: string; path: string }[];
}

export function getEntryPointsForPackage(
    logger: Logger,
    options: Options
): LazyDocumentationEntryPoint | undefined {
    const entryPoints = options.getValue("entryPoints");
    if (entryPoints.length > 1) {
        logger.warn(
            `In "package" mode, only the first entry point will be used.`
        );
    }

    const entryDir = entryPoints[0] ?? process.cwd();
    const packageJsonPath = join(entryDir, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
        logger.error(
            `No package.json file found in ${nicePath(
                entryDir
            )}, required for package mode.`
        );
        return;
    }

    const packageJson: unknown = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf-8")
    );

    if (!validate({ name: String, version: String }, packageJson)) {
        logger.error(
            `${nicePath(
                packageJsonPath
            )} must contain both "name" and "version" fields for package mode.`
        );
        return;
    }

    const packageExports = getPackageExports(entryDir, packageJson, options);

    return {
        packageName: packageJson.name,
        version: packageJson.version,
        // readmeFile: "",
        entryPoints: packageExports,
    };
}

function getPackageExports(
    packageDir: string,
    packageJson: { name: string },
    options: Options
): { name: string; path: string }[] {
    const jsEntryPoints: { name: string; path: string }[] = [];

    function addEntryPoint(name: string, exp: unknown) {
        if (typeof exp === "string") {
            jsEntryPoints.push({ name, path: join(packageDir, exp) });
        } else if (validate({ typedoc: String }, exp)) {
            jsEntryPoints.push({ name, path: join(packageDir, exp.typedoc) });
        } else {
            for (const key of ["import", "export", "default", "types"]) {
                if (validate({ [key]: String }, exp)) {
                    jsEntryPoints.push({
                        name,
                        path: join(packageDir, exp[key]),
                    });
                }
            }
        }
    }

    if (validate({ exports: String }, packageJson)) {
        jsEntryPoints.push({
            name: packageJson.name,
            path: join(packageDir, packageJson.exports),
        });
    } else if (validate({ exports: [Array, String] }, packageJson)) {
        jsEntryPoints.push(
            ...packageJson.exports.map((ex) => ({
                name: posix.join(packageJson.name, ex),
                path: join(packageDir, ex),
            }))
        );
    } else if (validate({ exports: {} }, packageJson)) {
        if (Object.keys(packageJson.exports).every((k) => k.startsWith("."))) {
            for (const [key, val] of Object.entries(packageJson.exports)) {
                addEntryPoint(posix.join(packageJson.name, key), val);
            }
        } else {
            // Conditional exports with sugar for a single export
            // https://nodejs.org/api/packages.html#exports-sugar
            addEntryPoint(packageJson.name, packageJson.exports);
        }
    } else if (validate({ main: String }, packageJson)) {
        jsEntryPoints.push({
            name: packageJson.name,
            path: join(packageDir, packageJson.main),
        });
    } else {
        jsEntryPoints.push({
            name: packageJson.name,
            path: join(packageDir, "index.js"),
        });
    }

    const fileNames = options.getFileNames();
    const co = options.getCompilerOptions();

    // Entry points are JS files, but this is a compiled TS project, so we
    // need to use source maps or outDir (+maybe rootDir) to figure out what
    // TS file the JS file came from.

    const tsEntryPoints: { name: string; path: string }[] = [];
    const outDir = co.outDir || packageDir;
    const rootDir = co.rootDir || getCommonDirectory(fileNames);

    for (const entry of jsEntryPoints) {
        // #1567 - if someone publishes TS expecting user to compile, or
        // if allowJs is set and this js file is included in the project.
        if (fileNames.includes(entry.path)) {
            tsEntryPoints.push(entry);
            continue;
        }

        const entryDir = dirname(join(rootDir, relative(outDir, entry.path)));
        const ext = extname(entry.path);
        switch (ext) {
            case ".mjs":
                tsEntryPoints.push({
                    name: entry.name,
                    path: normalizePath(
                        join(entryDir, basename(entry.path, ext) + ".mts")
                    ),
                });
                break;
            case ".cjs":
                tsEntryPoints.push({
                    name: entry.name,
                    path: normalizePath(
                        join(entryDir, basename(entry.path, ext) + ".cts")
                    ),
                });
                break;
            case ".js":
                const tsName = normalizePath(
                    join(entryDir, basename(entry.path, ext) + ".ts")
                );
                tsEntryPoints.push({ name: entry.name, path: tsName });
                tsEntryPoints.push({ name: entry.name, path: tsName + "x" });
                break;
        }
    }

    return tsEntryPoints.filter(({ path }) => {
        return fileNames.includes(path);
    });
}
