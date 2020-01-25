import * as FS from 'fs';
import * as Path from 'path';

import { Application } from '../application';
import { AbstractComponent, Component } from './component';
import { BindOption } from './options';
import { readFile } from './fs';

/**
 * Responsible for discovering and loading plugins.
 */
@Component({ name: 'plugin-host', internal: true })
export class PluginHost extends AbstractComponent<Application> {
    @BindOption('plugin')
    plugins!: string[];

    /**
     * Load all npm plugins.
     * @returns TRUE on success, otherwise FALSE.
     */
    load(): boolean {
        const logger = this.application.logger;
        const plugins = this.plugins.length ? this.plugins : this.discoverNpmPlugins();

        if (plugins.some(plugin => plugin.toLowerCase() === 'none')) {
            return true;
        }

        for (const plugin of plugins) {
            try {
                const instance = require(plugin);
                const initFunction = typeof instance.load === 'function'
                    ? instance.load
                    : instance                // support legacy plugins
                    ;
                if (typeof initFunction === 'function') {
                    initFunction(this);
                    logger.write('Loaded plugin %s', plugin);
                } else {
                    logger.error('Invalid structure in plugin %s, no function found.', plugin);
                }
            } catch (error) {
                logger.error('The plugin %s could not be loaded.', plugin);
                logger.writeln(error.stack);
                return false;
            }
        }
        return true;
    }

    /**
     * Discover all installed TypeDoc plugins.
     *
     * @returns A list of all npm module names that are qualified TypeDoc plugins.
     */
    private discoverNpmPlugins(): string[] {
        const result: string[] = [];
        const logger = this.application.logger;
        discover();
        return result;

        /**
         * Find all parent folders containing a `node_modules` subdirectory.
         */
        function discover() {
            let path = process.cwd(), previous: string;
            do {
                const modules = Path.join(path, 'node_modules');
                if (FS.existsSync(modules) && FS.statSync(modules).isDirectory()) {
                    discoverModules(modules);
                }

                previous = path;
                path = Path.resolve(Path.join(previous, '..'));
            } while (previous !== path);
        }

        /**
         * Scan the given `node_modules` directory for TypeDoc plugins.
         */
        function discoverModules(basePath: string) {
            const candidates: string[] = [];
            FS.readdirSync(basePath).forEach((name) => {
                const dir = Path.join(basePath, name);
                if (name.startsWith('@') && FS.statSync(dir).isDirectory()) {
                    FS.readdirSync(dir).forEach((n) => {
                        candidates.push(Path.join(name, n));
                    });
                }
                candidates.push(name);
            });
            candidates.forEach((name) => {
                const infoFile = Path.join(basePath, name, 'package.json');
                if (!FS.existsSync(infoFile)) {
                    return;
                }

                const info = loadPackageInfo(infoFile);
                if (isPlugin(info)) {
                    result.push(Path.join(basePath, name));
                }
            });
        }

        /**
         * Load and parse the given `package.json`.
         */
        function loadPackageInfo(fileName: string): any {
            try {
                return JSON.parse(readFile(fileName));
            } catch (error) {
                logger.error('Could not parse %s', fileName);
                return {};
            }
        }

        /**
         * Test whether the given package info describes a TypeDoc plugin.
         */
        function isPlugin(info: any): boolean {
            const keywords: unknown[] = info.keywords;
            if (!keywords || !Array.isArray(keywords)) {
                return false;
            }

            for (let i = 0, c = keywords.length; i < c; i++) {
                const keyword = keywords[i];
                if (typeof keyword === 'string' && keyword.toLowerCase() === 'typedocplugin') {
                    return true;
                }
            }

            return false;
        }
    }
}
