import * as Path from 'path';
import * as FS from 'fs';
import * as _ from 'lodash';

import { Component, Option } from '../../component';
import { OptionsComponent, OptionsReadMode, DiscoverEvent } from '../options';
import { ParameterType, ParameterHint } from '../declaration';

/**
 * Obtains option values from typedoc.js
 */
@Component({name: 'options:typedoc'})
export class TypedocReader extends OptionsComponent {
    @Option({
        name: TypedocReader.OPTIONS_KEY,
        help: 'Specify a js option file that should be loaded. If not specified TypeDoc will look for \'typedoc.js\' in the current directory.',
        type: ParameterType.String,
        hint: ParameterHint.File
    })
    options!: string;

    /**
     * The name of the parameter that specifies the options file.
     */
    private static OPTIONS_KEY = 'options';

    initialize() {
        this.listenTo(this.owner, DiscoverEvent.DISCOVER, this.onDiscover, -150);
    }

    onDiscover(event: DiscoverEvent) {
        // Do nothing until were fetching options
        if (event.mode !== OptionsReadMode.Fetch) {
            return;
        }

        let file: string | undefined;

        if (TypedocReader.OPTIONS_KEY in event.data) {
            let opts = event.data[TypedocReader.OPTIONS_KEY];

            if (opts && opts[0] === '.') {
                opts = Path.resolve(opts);
            }

            file = this.findTypedocFile(opts);

            if (!file || !FS.existsSync(file)) {
                event.addError('The options file could not be found with the given path %s.', opts);
                return;
            }
        } else if (this.application.isCLI) {
            file = this.findTypedocFile(process.cwd());
        }

        file && this.load(event, file);
    }

    /**
     * Search for the typedoc.js or typedoc.json file from the given path
     *
     * @param  path Path to the typedoc.(js|json) file. If path is a directory
     *   typedoc file will be attempted to be found at the root of this path
     * @return the typedoc.(js|json) file path or undefined
     */
    findTypedocFile(path: string): string | undefined {
        path = Path.resolve(path);

        if (FS.existsSync(path) && FS.statSync(path).isFile()) {
            return path;
        }

        let file = Path.join(path, 'typedoc.js');
        if (FS.existsSync(file)) {
            return file;
        }

        file += 'on'; // look for JSON file
        return FS.existsSync(file) ? file : undefined;
    }

    /**
     * Load the specified option file.
     *
     * @param event The event object from the DISCOVER event.
     * @param optionFile  The absolute path and file name of the option file.
     * @returns TRUE on success, otherwise FALSE.
     */
    load(event: DiscoverEvent, optionFile: string) {
        let data = require(optionFile);
        if (typeof data === 'function') {
            data = data(this.application);
        }

        if (!(typeof data === 'object')) {
            event.addError('The option file %s could not be read, it must either export a function or an object.', optionFile);
        } else {
            if (data.src) {
                if (typeof data.src === 'string') {
                    event.inputFiles = [data.src];
                } else if (_.isArray(data.src)) {
                    event.inputFiles = data.src;
                } else {
                    event.addError('The property \'src\' of the option file %s must be a string or an array.', optionFile);
                }

                delete data.src;
            }

            _.defaultsDeep(event.data, data);
        }
    }
}
