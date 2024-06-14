import { tempdirProject } from "@typestrong/fs-fixture-builder";
import type { Application } from "../../index";
import { loadPlugins } from "../../lib/utils/plugins";
import { TestLogger } from "../TestLogger";
import { join, resolve } from "path";
import { Internationalization } from "../../lib/internationalization/internationalization";

describe("loadPlugins", () => {
    let logger: TestLogger;
    const fakeApp = {
        i18n: new Internationalization(null).proxy,
    } as any as Application;
    beforeEach(() => {
        logger = fakeApp.logger = new TestLogger();
    });

    it("Should support loading a basic plugin", async () => {
        using project = tempdirProject();
        project.addJsonFile("package.json", {
            type: "commonjs",
            main: "index.js",
        });
        project.addFile("index.js", "exports.load = function load() {}");
        project.write();

        const plugin = resolve(project.cwd);
        await loadPlugins(fakeApp, [plugin]);
        logger.expectMessage(`info: Loaded plugin ${plugin}`);
    });

    it("Should support loading a ESM plugin", async () => {
        using project = tempdirProject();
        project.addJsonFile("package.json", {
            type: "module",
            main: "index.js",
        });
        project.addFile("index.js", "export function load() {}");
        project.write();

        const plugin = join(resolve(project.cwd), "index.js");
        await loadPlugins(fakeApp, [plugin]);
        logger.expectMessage(`info: Loaded plugin ${plugin}`);
    });

    it("Should handle errors when requiring plugins", async () => {
        using project = tempdirProject();
        project.addJsonFile("package.json", {
            type: "commonjs",
            main: "index.js",
        });
        project.addFile("index.js", "throw Error('bad')");
        project.write();

        const plugin = join(resolve(project.cwd), "index.js");
        await loadPlugins(fakeApp, [plugin]);
        logger.expectMessage(`error: The plugin ${plugin} could not be loaded`);
    });

    it("Should handle errors when loading plugins", async () => {
        using project = tempdirProject();
        project.addJsonFile("package.json", {
            type: "commonjs",
            main: "index.js",
        });
        project.addFile(
            "index.js",
            "exports.load = function load() { throw Error('bad') }",
        );
        project.write();

        const plugin = join(resolve(project.cwd), "index.js");
        await loadPlugins(fakeApp, [plugin]);
        logger.expectMessage(`error: The plugin ${plugin} could not be loaded`);
    });

    it("Should handle plugins without a load method", async () => {
        using project = tempdirProject();
        project.addJsonFile("package.json", {
            type: "commonjs",
            main: "index.js",
        });
        project.addFile("index.js", "");
        project.write();

        const plugin = join(resolve(project.cwd), "index.js");
        await loadPlugins(fakeApp, [plugin]);
        logger.expectMessage(
            `error: Invalid structure in plugin ${plugin}, no load function found`,
        );
    });
});
