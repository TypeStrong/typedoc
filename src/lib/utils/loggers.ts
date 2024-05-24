import ts from "typescript";
import { url } from "inspector";
import { resolve } from "path";
import { nicePath } from "./paths";
import type { MinimalSourceFile } from "./minimalSourceFile";
import type {
    TranslatedString,
    TranslationProxy,
} from "../internationalization/internationalization";
import type { IfInternal } from ".";

const isDebugging = () => !!url();

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

const Colors = {
    red: "\u001b[91m",
    yellow: "\u001b[93m",
    cyan: "\u001b[96m",
    gray: "\u001b[90m",
    black: "\u001b[47m\u001b[30m",
    reset: "\u001b[0m",
};

function color(text: string, color: keyof typeof Colors) {
    if ("NO_COLOR" in process.env) return text;

    return `${Colors[color]}${text}${Colors.reset}`;
}

const messagePrefixes = {
    [LogLevel.Error]: color("[error]", "red"),
    [LogLevel.Warn]: color("[warning]", "yellow"),
    [LogLevel.Info]: color("[info]", "cyan"),
    [LogLevel.Verbose]: color("[debug]", "gray"),
};

const dummyTranslationProxy: TranslationProxy = new Proxy(
    {} as TranslationProxy,
    {
        get: (_target, key) => {
            return (...args: string[]) =>
                String(key).replace(/\{(\d+)\}/g, (_, index) => {
                    return args[+index] ?? "(no placeholder)";
                });
        },
    },
);

type FormatArgs = [ts.Node?] | [number, MinimalSourceFile];

/**
 * A logger that will not produce any output.
 *
 * This logger also serves as the base class of other loggers as it implements
 * all the required utility functions.
 */
export class Logger {
    /**
     * Translation utility for internationalization.
     * @privateRemarks
     * This is fully initialized by the application during bootstrapping.
     */
    i18n: TranslationProxy = dummyTranslationProxy;

    /**
     * How many error messages have been logged?
     */
    errorCount = 0;

    /**
     * How many warning messages have been logged?
     */
    warningCount = 0;

    private seenErrors = new Set<string>();
    private seenWarnings = new Set<string>();

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
        this.seenErrors.clear();
    }

    /**
     * Reset the warning counter.
     */
    resetWarnings() {
        this.warningCount = 0;
        this.seenWarnings.clear();
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
    warn(text: IfInternal<TranslatedString, string>, node?: ts.Node): void;
    warn(
        text: IfInternal<TranslatedString, string>,
        pos: number,
        file: MinimalSourceFile,
    ): void;
    warn(text: string, ...args: FormatArgs): void {
        const text2 = this.addContext(text, LogLevel.Warn, ...args);
        if (this.seenWarnings.has(text2) && !isDebugging()) return;
        this.seenWarnings.add(text2);
        this.log(text2, LogLevel.Warn);
    }

    /**
     * Log the given error.
     *
     * @param text  The error that should be logged.
     */
    error(text: IfInternal<TranslatedString, string>, node?: ts.Node): void;
    error(
        text: IfInternal<TranslatedString, string>,
        pos: number,
        file: MinimalSourceFile,
    ): void;
    error(text: string, ...args: FormatArgs) {
        const text2 = this.addContext(text, LogLevel.Error, ...args);
        if (this.seenErrors.has(text2) && !isDebugging()) return;
        this.seenErrors.add(text2);
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

    /**
     * Print the given TypeScript log messages.
     *
     * @param diagnostics  The TypeScript messages that should be logged.
     */
    diagnostics(diagnostics: ReadonlyArray<ts.Diagnostic>) {
        diagnostics.forEach((diagnostic) => {
            this.diagnostic(diagnostic);
        });
    }

    /**
     * Print the given TypeScript log message.
     *
     * @param diagnostic  The TypeScript message that should be logged.
     */
    diagnostic(diagnostic: ts.Diagnostic) {
        const output = ts.formatDiagnosticsWithColorAndContext([diagnostic], {
            getCanonicalFileName: resolve,
            getCurrentDirectory: () => process.cwd(),
            getNewLine: () => ts.sys.newLine,
        });

        switch (diagnostic.category) {
            case ts.DiagnosticCategory.Error:
                this.log(output, LogLevel.Error);
                break;
            case ts.DiagnosticCategory.Warning:
                this.log(output, LogLevel.Warn);
                break;
            case ts.DiagnosticCategory.Message:
                this.log(output, LogLevel.Info);
        }
    }

    protected addContext(
        message: string,
        _level: LogLevel,
        ..._args: [ts.Node?] | [number, MinimalSourceFile]
    ): string {
        return message;
    }
}

/**
 * A logger that outputs all messages to the console.
 */
export class ConsoleLogger extends Logger {
    /**
     * Print a log message.
     *
     * @param message  The message itself.
     * @param level  The urgency of the log message.
     */
    override log(message: string, level: Exclude<LogLevel, LogLevel.None>) {
        super.log(message, level);
        if (level < this.level && !isDebugging()) {
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
        ...args: [ts.Node?] | [number, MinimalSourceFile]
    ): string {
        if (typeof args[0] === "undefined") {
            return `${messagePrefixes[level]} ${message}`;
        }

        if (typeof args[0] !== "number") {
            return this.addContext(
                message,
                level,
                args[0].getStart(args[0].getSourceFile(), false),
                args[0].getSourceFile(),
            );
        }

        const [pos, file] = args as [number, MinimalSourceFile];

        const path = nicePath(file.fileName);
        const { line, character } = file.getLineAndCharacterOfPosition(pos);

        const location = `${color(path, "cyan")}:${color(
            `${line + 1}`,
            "yellow",
        )}:${color(`${character}`, "yellow")}`;

        const start = file.text.lastIndexOf("\n", pos) + 1;
        let end = file.text.indexOf("\n", start);
        if (end === -1) end = file.text.length;

        const prefix = `${location} - ${messagePrefixes[level]}`;
        const context = `${color(
            `${line + 1}`,
            "black",
        )}    ${file.text.substring(start, end)}`;

        return `${prefix} ${message}\n\n${context}\n`;
    }
}
