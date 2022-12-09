import { deepStrictEqual as equal } from "assert";
import type { Application } from "../../lib/application";
import { loadPlugins } from "../../lib/utils";
import * as Path from "path";

describe("Plugins", () => {
    async function testPlugin(plugin: string) {
        let loaded = false;
        const app: Application = {
            // @ts-expect-error incomplete implementation
            logger: { info: () => {}, error: () => {} },
            // this method will be invoked by the test plugin to prove it's been loaded
            convert: () => {
                loaded = true;

                return undefined;
            },
        };
        const pluginName = Path.join(__dirname, "fixtures", plugin);
        const plugins = [pluginName];

        await loadPlugins(app, plugins);

        equal(loaded, true);
    }

    it("Should load plugins", async () => {
        await testPlugin("sync-plugin.js");
    });

    it("Should load async plugins", async () => {
        await testPlugin("async-plugin.js");
    });

    it("Should load slow async plugins", async () => {
        await testPlugin("slow-async-plugin.js");
    });
});
