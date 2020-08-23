import * as typescript from 'typescript';

import { Application } from './application';
import { BindOption } from './utils/options';
import { getOptionsHelp } from './utils/options/help';
import { ArgumentsReader, TypeDocReader } from './utils/options/readers';
import { TSConfigReader } from './utils/options/readers/tsconfig';
import { TypeDocAndTSOptions } from './utils/options/declaration';

export const enum ExitCode {
    OptionError = 1,
    NoInputFiles = 2,
    NoOutput = 3,
    CompileError = 4,
    OutputError = 5
}

export class CliApplication extends Application {
    @BindOption('out')
    out!: string;

    @BindOption('json')
    json!: string;

    @BindOption('version')
    version!: boolean;

    @BindOption('help')
    help!: boolean;

    /**
     * Run TypeDoc from the command line.
     */
    bootstrap(options?: Partial<TypeDocAndTSOptions>) {
        this.options.addReader(new ArgumentsReader(0));
        this.options.addReader(new TypeDocReader());
        this.options.addReader(new TSConfigReader());
        this.options.addReader(new ArgumentsReader(300));

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
                    this.logger.log("The './docs' directory has been set as the output location by default");
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
}
