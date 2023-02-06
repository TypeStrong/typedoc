import * as FS from "fs";
import * as Path from "path";

import type { Application } from "../application";
import type { Logger } from "./loggers";
import { nicePath } from "./paths";
import { validate } from "./validation";

export function loadPlugins(app: Application, plugins: readonly string[]) {
    if (plugins.includes("none")) {
        return;
    }

    for (const plugin of plugins) {
        const pluginDisplay = getPluginDisplayName(plugin);

        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const instance = require(plugin);
            const initFunction = instance.load;

            if (typeof initFunction === "function") {
                initFunction(app);
                app.logger.info(`Loaded plugin ${pluginDisplay}`);
            } else {
                app.logger.error(
                    `Invalid structure in plugin ${pluginDisplay}, no load function found.`
                );
            }
        } catch (error) {
            app.logger.error(
                `The plugin ${pluginDisplay} could not be loaded.`
            );
            if (error instanceof Error && error.stack) {
                app.logger.error(error.stack);
            }
        }
    }
}

export function discoverPlugins(app: Application): string[] {
    // If the plugin option is set, then automatic discovery is disabled, and we should just
    // return the plugins that the user has asked for.
    if (app.options.isSet("plugin")) {
        return app.options.getValue("plugin");
    }

    const result: string[] = [];
    discover();
    return result;

    /**
     * Find all parent folders containing a `node_modules` subdirectory.
     */
    function discover() {
        let path = process.cwd();
        let previous: string;

        do {
            const modules = Path.join(path, "node_modules");
            if (FS.existsSync(modules) && FS.statSync(modules).isDirectory()) {
                discoverModules(modules);
            }

            previous = path;
            path = Path.resolve(Path.join(previous, ".."));
        } while (previous !== path);
    }

    /**
     * Scan the given `node_modules` directory for TypeDoc plugins.
     */
    function discoverModules(basePath: string) {
        const candidates: string[] = [];
        FS.readdirSync(basePath).forEach((name) => {
            const dir = Path.join(basePath, name);
            if (name.startsWith("@") && FS.statSync(dir).isDirectory()) {
                FS.readdirSync(dir).forEach((n) => {
                    candidates.push(Path.join(name, n));
                });
            }
            candidates.push(name);
        });
        candidates.forEach((name) => {
            const infoFile = Path.join(basePath, name, "package.json");
            if (!FS.existsSync(infoFile)) {
                return;
            }

            const info = loadPackageInfo(app.logger, infoFile);
            if (isPlugin(info)) {
                result.push(Path.join(basePath, name));
            }
        });
    }
}

/**
 * Load and parse the given `package.json`.
 */
function loadPackageInfo(logger: Logger, fileName: string): unknown {
    try {
        return require(fileName);
    } catch {
        logger.error(`Could not parse ${fileName}`);
        return {};
    }
}

const PLUGIN_KEYWORDS = ["typedocplugin", "typedoc-plugin", "typedoc-theme"];

/**
 * Test whether the given package info describes a TypeDoc plugin.
 */
function isPlugin(info: unknown): boolean {
    if (!validate({ keywords: [Array, String] }, info)) {
        return false;
    }

    return info.keywords.some((keyword) =>
        PLUGIN_KEYWORDS.includes(keyword.toLocaleLowerCase())
    );
}

function getPluginDisplayName(plugin: string) {
    const path = nicePath(plugin);
    if (path.startsWith("./node_modules/")) {
        return path.substring("./node_modules/".length);
    }
    return plugin;
}
