import type { IfInternal } from "./general.js";
import type { TranslatedString } from "./i18n.js";
import type { MinimalNode, MinimalSourceFile } from "./minimalSourceFile.js";

/**
 * List of known log levels. Used to specify the urgency of a log message.
 */
export enum LogLevel {
    Verbose,
    Info,
    Warn,
    Error,
    None,
}

const messagePrefixes = {
    [LogLevel.Error]: "[error]",
    [LogLevel.Warn]: "[warning]",
    [LogLevel.Info]: "[info]",
    [LogLevel.Verbose]: "[debug]",
};

/**
 * A logger that will not produce any output.
 *
 * This logger also serves as the base class of other loggers as it implements
 * all the required utility functions.
 */
export class Logger {
    /**
     * How many error messages have been logged?
     */
    errorCount = 0;

    /**
     * How many warning messages have been logged?
     */
    warningCount = 0;

    /**
     * The minimum logging level to print.
     */
    level = LogLevel.Info;

    /**
     * Has an error been raised through the log method?
     */
    hasErrors(): boolean {
        return this.errorCount > 0;
    }

    /**
     * Has a warning been raised through the log method?
     */
    hasWarnings(): boolean {
        return this.warningCount > 0;
    }

    /**
     * Reset the error counter.
     */
    resetErrors() {
        this.errorCount = 0;
    }

    /**
     * Reset the warning counter.
     */
    resetWarnings() {
        this.warningCount = 0;
    }

    /**
     * Log the given verbose message.
     *
     * @param text  The message that should be logged.
     */
    verbose(text: string) {
        this.log(this.addContext(text, LogLevel.Verbose), LogLevel.Verbose);
    }

    /** Log the given info message. */
    info(text: IfInternal<TranslatedString, string>) {
        this.log(this.addContext(text, LogLevel.Info), LogLevel.Info);
    }

    /**
     * Log the given warning.
     *
     * @param text  The warning that should be logged.
     */
    warn(text: IfInternal<TranslatedString, string>, node?: MinimalNode): void;
    warn(
        text: IfInternal<TranslatedString, string>,
        pos: number,
        file: MinimalSourceFile,
    ): void;
    warn(text: string, ...args: [MinimalNode?] | [number, MinimalSourceFile]): void {
        const text2 = this.addContext(text, LogLevel.Warn, ...args);
        this.log(text2, LogLevel.Warn);
    }

    /**
     * Log the given error.
     *
     * @param text  The error that should be logged.
     */
    error(text: IfInternal<TranslatedString, string>, node?: MinimalNode): void;
    error(
        text: IfInternal<TranslatedString, string>,
        pos: number,
        file: MinimalSourceFile,
    ): void;
    error(text: string, ...args: [MinimalNode?] | [number, MinimalSourceFile]) {
        const text2 = this.addContext(text, LogLevel.Error, ...args);
        this.log(text2, LogLevel.Error);
    }

    /**
     * Print a log message.
     *
     * @param _message The message itself.
     * @param level The urgency of the log message.
     */
    log(_message: string, level: LogLevel) {
        if (level === LogLevel.Error) {
            this.errorCount += 1;
        }
        if (level === LogLevel.Warn) {
            this.warningCount += 1;
        }
    }

    protected addContext(
        message: string,
        _level: Exclude<LogLevel, LogLevel.None>,
        ..._args: [MinimalNode?] | [number, MinimalSourceFile]
    ): string {
        return message;
    }
}

/**
 * Logger implementation which logs to the console
 */
export class ConsoleLogger extends Logger {
    override log(message: string, level: Exclude<LogLevel, LogLevel.None>) {
        super.log(message, level);
        if (level < this.level) {
            return;
        }

        const method = (
            {
                [LogLevel.Error]: "error",
                [LogLevel.Warn]: "warn",
                [LogLevel.Info]: "info",
                [LogLevel.Verbose]: "log",
            } as const
        )[level];

        // eslint-disable-next-line no-console
        console[method](message);
    }

    protected override addContext(
        message: string,
        level: Exclude<LogLevel, LogLevel.None>,
        ..._args: [MinimalNode?] | [number, MinimalSourceFile]
    ): string {
        return `${messagePrefixes[level]} ${message}`;
    }
}
