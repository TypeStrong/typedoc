import { Application } from "./application";
import { IOptionsReadResult } from "./utils/options/options";
export declare const enum ExitCode {
    OptionError = 1,
    NoInputFiles = 2,
    NoOutput = 3,
    CompileError = 4,
    OutputError = 5,
}
export declare class CliApplication extends Application {
    out: string;
    json: string;
    version: boolean;
    help: boolean;
    protected bootstrap(options?: Object): IOptionsReadResult;
    readonly isCLI: boolean;
}
