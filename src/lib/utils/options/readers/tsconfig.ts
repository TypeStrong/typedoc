import * as Path from "path";
import * as FS from "fs";
import * as _ from "lodash";
import * as ts from "typescript";

import {Component, Option} from "../../component";
import {OptionsComponent, DiscoverEvent} from "../options";
import {ParameterType, ParameterHint} from "../declaration";
import {TypeScriptSource} from "../sources/typescript";


@Component({name:"options:tsconfig"})
export class TSConfigReader extends OptionsComponent
{
    @Option({
        name: TSConfigReader.OPTIONS_KEY,
        help: 'Specify a js option file that should be loaded. If not specified TypeDoc will look for \'typedoc.js\' in the current directory.',
        type: ParameterType.String,
        hint: ParameterHint.File
    })
    options:string;

    /**
     * The name of the parameter that specifies the tsconfig file.
     */
    private static OPTIONS_KEY:string = 'tsconfig';


    initialize() {
        this.listenTo(this.owner, DiscoverEvent.DISCOVER, this.onDiscover, -100);
    }


    onDiscover(event:DiscoverEvent) {
        if (TSConfigReader.OPTIONS_KEY in event.data) {
            this.load(event, Path.resolve(event.data[TSConfigReader.OPTIONS_KEY]));
        } else if (this.application.isCLI) {
            let file:string = ts.findConfigFile(".", ts.sys.fileExists);
            // If file is undefined, we found no file to load.
            if (file) {
                this.load(event, file);
            }
        }
    }


    /**
     * Load the specified tsconfig file.
     *
     * @param event  The event that triggered the loading. Used to store error messages.
     * @param fileName  The absolute path and file name of the tsconfig file.
     */
    load(event:DiscoverEvent, fileName:string) {
       if (!FS.existsSync(fileName)) {
            event.addError('The tsconfig file %s does not exist.', fileName);
            return;
        }
        
        const data = ts.readConfigFile(fileName, ts.sys.readFile).config;
        
        if (data === undefined) {
            event.addError('The tsconfig file %s does not contain valid JSON.', fileName);
            return;
        }
        
        if (!_.isPlainObject(data)) {
            event.addError('The tsconfig file %s does not contain a JSON object.', fileName);
            return;
        }

        let {options, fileNames} = ts.parseJsonConfigFileContent(
            data,
            ts.sys,
            Path.resolve(Path.dirname(fileName)),
            {},
            Path.resolve(fileName));

        event.inputFiles = fileNames;
        options = _.clone(options);
        
        if (!data.typedocOptions) {
            data.typedocOptions = Object.create(null);
        }

        for (const key of TypeScriptSource.IGNORED) {
            delete options[key];
            delete data.typedocOptions[key];
        }
        
        _.defaults(event.data, data.typedocOptions);
        
        for (const key in options) {
            if (!_.isUndefined(event.data[key])) {
                delete options[key];
            }
        }

        event.compilerOptions = options;
    }
}
