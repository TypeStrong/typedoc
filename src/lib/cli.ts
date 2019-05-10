import * as typescript from 'typescript';

import { Application } from './application';
import { Option } from './utils/component';
import { OptionsReadResult } from './utils/options/options';
import { ParameterHint, ParameterType } from './utils/options/declaration';
import { getOptionsHelp } from './utils/options/help';

export const enum ExitCode {
    OptionError = 1,
    NoInputFiles = 2,
    NoOutput = 3,
    CompileError = 4,
    OutputError = 5
}

export class CliApplication extends Application {
    @Option({
        name: 'out',
        help: 'Specifies the location the documentation should be written to.',
        hint: ParameterHint.Directory
    })
    out!: string;

    @Option({
        name: 'json',
        help: 'Specifies the location and file name a json file describing the project is written to.',
        hint: ParameterHint.File
    })
    json!: string;

    @Option({
        name: 'version',
        short: 'v',
        help: 'Print the TypeDoc\'s version.',
        type: ParameterType.Boolean
    })
    version!: boolean;

    @Option({
        name: 'help',
        short: 'h',
        help: 'Print this message.',
        type: ParameterType.Boolean
    })
    help!: boolean;

    /**
     * Run TypeDoc from the command line.
     */
    protected bootstrap(options?: Object): OptionsReadResult {
        const result = super.bootstrap(options);
        if (result.hasErrors) {
            return process.exit(ExitCode.OptionError);
        }

        if (this.version) {
            typescript.sys.write(this.toString());
        } else if (this.help) {
            typescript.sys.write(getOptionsHelp(this.options));
        } else if (result.inputFiles.length === 0) {
            typescript.sys.write(getOptionsHelp(this.options));
            process.exit(ExitCode.NoInputFiles);
        } else {
            const src = this.expandInputFiles(result.inputFiles);
            const project = this.convert(src);
            if (project) {
                if (this.out) {
                    this.generateDocs(project, this.out);
                }
                if (this.json) {
                    this.generateJson(project, this.json);
                }
                if (!this.out && !this.json) {
                    this.logger.log("No 'out' or 'json' option has been set");
                    this.logger.log("The './docs' directory has be set as the output location by default");
                    this.generateDocs(project, './docs');
                }
                if (this.logger.hasErrors()) {
                    process.exit(ExitCode.OutputError);
                }
            } else {
                process.exit(ExitCode.CompileError);
            }
        }

        return result;
    }

    get isCLI(): boolean {
        return true;
    }
}
