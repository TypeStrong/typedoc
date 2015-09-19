import * as typescript from "typescript";

import {Application} from "./application";
import {Option} from "./utils/component";
import {OptionsReadMode, IOptionsReadResult} from "./utils/options/options";
import {ParameterHint, ParameterType} from "./utils/options/declaration";
import {getOptionsHelp} from "./utils/options/help";


export const enum ExitCode
{
    OptionError  = 1,
    NoInputFiles = 2,
    NoOutput     = 3,
    CompileError = 4,
    OutputError  = 5
}


export class CliApplication extends Application
{
    @Option({
        name:  'out',
        help:  'Specifies the location the documentation should be written to.',
        hint:  ParameterHint.Directory
    })
    out:string;

    @Option({
        name:  'json',
        help:  'Specifies the location and file name a json file describing the project is written to.',
        hint:  ParameterHint.File
    })
    json:string;

    @Option({
        name:  'version',
        short: 'v',
        help:  'Print the TypeDoc\'s version.',
        type:  ParameterType.Boolean
    })
    version:boolean;

    @Option({
        name:  'help',
        short: 'h',
        help:  'Print this message.',
        type:  ParameterType.Boolean
    })
    help:boolean;



    /**
     * Run TypeDoc from the command line.
     */
    protected bootstrap(options?:Object):IOptionsReadResult {
        var result = super.bootstrap(options);
        if (result.hasErrors) {
            process.exit(ExitCode.OptionError);
            return;
        }

        if (this.version) {
            typescript.sys.write(this.toString());
        } else if (this.help) {
            typescript.sys.write(getOptionsHelp(this.options));
        } else if (result.inputFiles.length === 0) {
            typescript.sys.write(getOptionsHelp(this.options));
            process.exit(ExitCode.NoInputFiles);
        } else if (!this.out && !this.json) {
            this.logger.error("You must either specify the 'out' or 'json' option.");
            process.exit(ExitCode.NoOutput);
        } else {
            var src = this.expandInputFiles(result.inputFiles);
            var project = this.convert(src);
            if (project) {
                if (this.out) this.generateDocs(project, this.out);
                if (this.json) this.generateJson(project, this.json);
                if (this.logger.hasErrors()) {
                    process.exit(ExitCode.OutputError);
                }
            } else {
                process.exit(ExitCode.CompileError);
            }
        }

        return result;
    }


    get isCLI():boolean {
        return true;
    }
}
