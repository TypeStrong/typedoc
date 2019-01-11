import * as Path from 'path';
import * as FS from 'fs';
import * as _ from 'lodash';
import * as ts from 'typescript';

import { Component, Option } from '../../component';
import { OptionsComponent, OptionsReadMode, DiscoverEvent } from '../options';
import { ParameterType, ParameterHint } from '../declaration';
import { TypeScriptSource } from '../sources/typescript';

/**
 * Obtains option values from tsconfig.json
 */
@Component({name: 'options:tsconfig'})
export class TSConfigReader extends OptionsComponent {
    @Option({
        name: TSConfigReader.OPTIONS_KEY,
        help: 'Specify a typescript config file that should be loaded. If not specified TypeDoc will look for \'tsconfig.json\' in the current directory.',
        type: ParameterType.String,
        hint: ParameterHint.File
    })
    options!: string;

    /**
     * The name of the parameter that specifies the tsconfig file.
     */
    private static OPTIONS_KEY = 'tsconfig';

    /**
     * The name of the parameter that specifies the TS project
     *
     * https://github.com/Microsoft/TypeScript/blob/master/src/compiler/commandLineParser.ts#L49
     */
    private static PROJECT_KEY = 'project';

    initialize() {
        this.listenTo(this.owner, DiscoverEvent.DISCOVER, this.onDiscover, -100);
    }

    onDiscover(event: DiscoverEvent) {
        // Do nothing until were fetching options
        if (event.mode !== OptionsReadMode.Fetch) {
            return;
        }

        let file: string | undefined;

        if (TSConfigReader.OPTIONS_KEY in event.data) {
            const tsconfig = event.data[TSConfigReader.OPTIONS_KEY];

            if (FS.existsSync(tsconfig) && FS.statSync(tsconfig).isFile()) {
                file = Path.resolve(tsconfig);
            } else {
                file = ts.findConfigFile(tsconfig, ts.sys.fileExists);
            }

            if (!file || !FS.existsSync(file)) {
                event.addError('The tsconfig file %s does not exist.', file || '');
                return;
            }
        } else if (TSConfigReader.PROJECT_KEY in event.data) {
            const resolved = Path.resolve(event.data[TSConfigReader.PROJECT_KEY]);
            // If the file exists, use it
            if (FS.existsSync(resolved)) {
                file = resolved;
            } else {
                // Use TS to find the file, since it could be a directory
                file = ts.findConfigFile(resolved, ts.sys.fileExists);
            }
        } else if (this.application.isCLI) {
            // No file or directory has been specified so find the file in the root of the project
            file = ts.findConfigFile('.', ts.sys.fileExists);
        }

        // If file is undefined, we found no file to load.
        if (file) {
            this.load(event, file);
        }
    }

    /**
     * Load the specified tsconfig file.
     *
     * @param event  The event that triggered the loading. Used to store error messages.
     * @param fileName  The absolute path and file name of the tsconfig file.
     */
    load(event: DiscoverEvent, fileName: string) {
        const { config } = ts.readConfigFile(fileName, ts.sys.readFile);
        if (config === undefined) {
            event.addError('No valid tsconfig file found for %s.', fileName);
            return;
        }
        if (!_.isPlainObject(config)) {
            event.addError('The tsconfig file %s does not contain a JSON object.', fileName);
            return;
        }

        const { fileNames, options, raw: { typedocOptions }} = ts.parseJsonConfigFileContent(
            config,
            ts.sys,
            Path.resolve(Path.dirname(fileName)),
            {},
            Path.resolve(fileName));

        event.inputFiles = fileNames;

        const ignored = TypeScriptSource.IGNORED;
        for (const key of ignored) {
            delete options[key];
        }

        _.defaults(event.data, typedocOptions, options);
    }
}
