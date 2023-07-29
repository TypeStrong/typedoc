import { isAbsolute } from "path";
import { pathToFileURL } from "url";

import type { Application } from "../application";
import { nicePath } from "./paths";

export async function loadPlugins(
    app: Application,
    plugins: readonly string[],
) {
    for (const plugin of plugins) {
        const pluginDisplay = getPluginDisplayName(plugin);

        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            let instance: any;
            try {
                instance = require(plugin);
            } catch (error: any) {
                if (error.code === "ERR_REQUIRE_ESM") {
                    // On Windows, we need to ensure this path is a file path.
                    // Or we'll get ERR_UNSUPPORTED_ESM_URL_SCHEME
                    const esmPath = isAbsolute(plugin)
                        ? pathToFileURL(plugin).toString()
                        : plugin;
                    instance = await import(esmPath);
                } else {
                    throw error;
                }
            }
            const initFunction = instance.load;

            if (typeof initFunction === "function") {
                await initFunction(app);
                app.logger.info(`Loaded plugin ${pluginDisplay}`);
            } else {
                app.logger.error(
                    `Invalid structure in plugin ${pluginDisplay}, no load function found.`,
                );
            }
        } catch (error) {
            app.logger.error(
                `The plugin ${pluginDisplay} could not be loaded.`,
            );
            if (error instanceof Error && error.stack) {
                app.logger.error(error.stack);
            }
        }
    }
}

function getPluginDisplayName(plugin: string) {
    const path = nicePath(plugin);
    if (path.startsWith("./node_modules/")) {
        return path.substring("./node_modules/".length);
    }
    return plugin;
}
