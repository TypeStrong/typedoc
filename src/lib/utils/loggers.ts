import * as ts from "typescript";
import { url } from "inspector";
import { resolve } from "path";
import { nicePath } from "./paths";

const isDebugging = () => !!url();

/**
 * List of known log levels. Used to specify the urgency of a log message.
 */
export enum LogLevel {
    Verbose,
    Info,
    Warn,
    Error,
}

const Colors = {
    red: "\u001b[91m",
    yellow: "\u001b[93m",
    cyan: "\u001b[96m",
    gray: "\u001b[90m",
    black: "\u001b[47m\u001b[30m",
    reset: "\u001b[0m",
};

function color(text: string | number, color: keyof typeof Colors) {
    if ("NO_COLOR" in process.env) return `${text}`;

    return `${Colors[color]}${text}${Colors.reset}`;
}

const messagePrefixes = {
    [LogLevel.Error]: color("Error", "red"),
    [LogLevel.Warn]: color("Warning", "yellow"),
    [LogLevel.Info]: color("Info", "cyan"),
    [LogLevel.Verbose]: color("Debug", "gray"),
};

function withContext(message: string, level: LogLevel, node?: ts.Node) {
    if (!node) {
        return `${messagePrefixes[level]} ${message}`;
    }

    const file = node.getSourceFile();
    const path = nicePath(file.fileName);
    const { line, character } = ts.getLineAndCharacterOfPosition(
        file,
        node.pos
    );

    const location = `${color(path, "cyan")}:${color(
        line + 1,
        "yellow"
    )}:${color(character, "yellow")}`;

    const start = file.text.lastIndexOf("\n", node.pos) + 1;
    let end = file.text.indexOf("\n", start);
    if (end === -1) end = file.text.length;

    const prefix = `${location} - ${messagePrefixes[level]}`;
    const context = `${color(line + 1, "black")}    ${file.text.substring(
        start,
        end
    )}`;

    return `${prefix} ${message}\n${context}`;
}

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
     * @param args  The arguments that should be printed into the given message.
     */
    verbose(text: string) {
        this.log(text, LogLevel.Verbose);
    }

    /** Log the given info message. */
    info(text: string) {
        this.log(text, LogLevel.Info);
    }

    /**
     * Log the given warning.
     *
     * @param text  The warning that should be logged.
     * @param args  The arguments that should be printed into the given warning.
     */
    warn(text: string, node?: ts.Node) {
        if (this.seenWarnings.has(text)) return;
        this.seenWarnings.add(text);
        this.log(text, LogLevel.Warn, node);
    }

    /**
     * Log the given error.
     *
     * @param text  The error that should be logged.
     * @param args  The arguments that should be printed into the given error.
     */
    error(text: string, node?: ts.Node) {
        if (this.seenErrors.has(text)) return;
        this.seenErrors.add(text);
        this.log(text, LogLevel.Error, node);
    }

    /** @internal */
    deprecated(text: string, addStack = true) {
        if (addStack) {
            const stack = new Error().stack?.split("\n");
            if (stack && stack.length >= 4) {
                text = text + "\n" + stack[3];
            }
        }
        this.warn(text);
    }

    /**
     * Print a log message.
     *
     * @param _message The message itself.
     * @param level The urgency of the log message.
     * @param _node Optional node to be used to provide additional context about the message.
     */
    log(_message: string, level: LogLevel, _node?: ts.Node) {
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
}

/**
 * A logger that outputs all messages to the console.
 */
export class ConsoleLogger extends Logger {
    /**
     * Create a new ConsoleLogger instance.
     */
    constructor() {
        super();
    }

    /**
     * Print a log message.
     *
     * @param message  The message itself.
     * @param level  The urgency of the log message.
     */
    override log(message: string, level: LogLevel, node?: ts.Node) {
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

        console[method](withContext(message, level, node));
    }
}

/**
 * A logger that calls a callback function.
 */
export class CallbackLogger extends Logger {
    /**
     * This loggers callback function
     */
    callback: Function;

    /**
     * Create a new CallbackLogger instance.
     *
     * @param callback  The callback that should be used to log messages.
     */
    constructor(callback: Function) {
        super();
        this.callback = callback;
    }

    /**
     * Print a log message.
     *
     * @param message  The message itself.
     * @param level  The urgency of the log message.
     */
    override log(message: string, level: LogLevel) {
        super.log(message, level);
        this.callback(message, level);
    }
}
