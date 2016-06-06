import * as Path from "path";
import * as FS from "fs";
import * as _ from "lodash";

import {Component, Option} from "../../component";
import {OptionsComponent, DiscoverEvent} from "../options";
import {ParameterType, ParameterHint} from "../declaration";


@Component({name:"options:typedoc"})
export class TypedocReader extends OptionsComponent
{
    @Option({
        name: TypedocReader.OPTIONS_KEY,
        help: 'Specify a js option file that should be loaded. If not specified TypeDoc will look for \'typedoc.js\' in the current directory.',
        type: ParameterType.String,
        hint: ParameterHint.File
    })
    options:string;

    /**
     * The name of the parameter that specifies the options file.
     */
    private static OPTIONS_KEY:string = 'options';



    initialize() {
        this.listenTo(this.owner, DiscoverEvent.DISCOVER, this.onDiscover, -100);
    }


    onDiscover(event:DiscoverEvent) {
        if (TypedocReader.OPTIONS_KEY in event.data) {
            this.load(event, Path.resolve(event.data[TypedocReader.OPTIONS_KEY]));
        } else if (this.application.isCLI) {
            var file = Path.resolve('typedoc.js');
            if (FS.existsSync(file)) {
                this.load(event, file);
            }
        }
    }


    /**
     * Load the specified option file.
     *
     * @param optionFile  The absolute path and file name of the option file.
     * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
     *   will simply skip all unknown arguments.
     * @returns TRUE on success, otherwise FALSE.
     */
    load(event:DiscoverEvent, optionFile:string) {
        if (!FS.existsSync(optionFile)) {
            event.addError('The option file %s does not exist.', optionFile);
            return;
        }

        var data = require(optionFile);
        if (typeof data == 'function') {
            data = data(this.application);
        }

        if (!(typeof data == 'object')) {
            event.addError('The option file %s could not be read, it must either export a function or an object.', optionFile);
        } else {
            if (data.src) {
                if (typeof data.src == 'string') {
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
