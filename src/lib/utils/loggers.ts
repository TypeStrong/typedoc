import ts from "typescript";
import { resolve } from "path";
import { nicePath } from "./paths.js";
import { ConsoleLogger, type Logger, LogLevel, type MinimalNode, type MinimalSourceFile } from "#utils";

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

export function diagnostics(logger: Logger, diagnostics: readonly ts.Diagnostic[]) {
    for (const d of diagnostics) {
        diagnostic(logger, d);
    }
}

export function diagnostic(logger: Logger, diagnostic: ts.Diagnostic) {
    const output = ts.formatDiagnosticsWithColorAndContext([diagnostic], {
        getCanonicalFileName: resolve,
        getCurrentDirectory: () => process.cwd(),
        getNewLine: () => ts.sys.newLine,
    });

    switch (diagnostic.category) {
        case ts.DiagnosticCategory.Error:
            logger.log(output, LogLevel.Error);
            break;
        case ts.DiagnosticCategory.Warning:
            logger.log(output, LogLevel.Warn);
            break;
        case ts.DiagnosticCategory.Message:
            logger.log(output, LogLevel.Info);
            break;
    }
}

/**
 * A logger that outputs all messages to the console.
 */
export class FancyConsoleLogger extends ConsoleLogger {
    protected override addContext(
        message: string,
        level: Exclude<LogLevel, LogLevel.None>,
        ...args: [MinimalNode?] | [number, MinimalSourceFile]
    ): string {
        if (typeof args[0] === "undefined") {
            return `${messagePrefixes[level]} ${message}`;
        }

        if (typeof args[0] !== "number") {
            const node = args[0] as ts.Node;

            return this.addContext(
                message,
                level,
                node.getStart(node.getSourceFile(), false),
                args[0].getSourceFile(),
            );
        }

        const [pos, file] = args as [number, MinimalSourceFile];

        const path = nicePath(file.fileName);
        const { line, character } = file.getLineAndCharacterOfPosition(pos);

        const location = `${color(path, "cyan")}:${
            color(
                `${line + 1}`,
                "yellow",
            )
        }:${color(`${character}`, "yellow")}`;

        const start = file.text.lastIndexOf("\n", pos) + 1;
        let end = file.text.indexOf("\n", start);
        if (end === -1) end = file.text.length;

        const prefix = `${location} - ${messagePrefixes[level]}`;
        const context = `${
            color(
                `${line + 1}`,
                "black",
            )
        }    ${file.text.substring(start, end)}`;

        return `${prefix} ${message}\n\n${context}\n`;
    }
}
