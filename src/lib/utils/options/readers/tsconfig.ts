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
            var file = Path.resolve('tsconfig.json');
            if (FS.existsSync(file)) {
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

        var data = ts.readConfigFile(fileName, (fileName) => ts.sys.readFile(fileName)).config;
        if (data === undefined) {
            event.addError('The tsconfig file %s does not contain valid JSON.', fileName);
            return;
        }
        if (!_.isPlainObject(data)) {
            event.addError('The tsconfig file %s does not contain a JSON object.', fileName);
            return;
        }

        if ("files" in data && _.isArray(data.files)) {
            event.inputFiles = data.files;
        }

        if ("compilerOptions" in data) {
            var ignored = TypeScriptSource.IGNORED;
            var compilerOptions = _.clone(data.compilerOptions);
            for (var key of ignored) {
                delete compilerOptions[key];
            }

            _.merge(event.data, compilerOptions);
        }

        if ("typedocOptions" in data) {
            _.merge(event.data, data.typedocOptions);
        }
    }
}
