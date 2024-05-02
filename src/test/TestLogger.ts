import { Logger, LogLevel } from "../lib/utils";
import { fail, ok } from "assert";
import ts from "typescript";
import { resolve } from "path";
import {
    Internationalization,
    type TranslationProxy,
} from "../lib/internationalization/internationalization";

const levelMap: Record<LogLevel, string> = {
    [LogLevel.None]: "none: ",
    [LogLevel.Error]: "error: ",
    [LogLevel.Warn]: "warn: ",
    [LogLevel.Info]: "info: ",
    [LogLevel.Verbose]: "debug: ",
};

export class TestLogger extends Logger {
    messages: string[] = [];
    override i18n: TranslationProxy = new Internationalization(null).proxy;

    reset() {
        this.resetErrors();
        this.resetWarnings();
        this.messages = [];
    }

    expectMessage(message: string) {
        const regex = createRegex(message);
        const index = this.messages.findIndex((m) => regex.test(m));
        if (index === -1) {
            const messages = this.messages.join("\n\t") || "(none logged)";
            fail(
                `Expected "${message}" to be logged. The logged messages were:\n\t${messages}`,
            );
        }
        this.messages.splice(index, 1);
    }

    expectNoMessage(message: string) {
        const regex = createRegex(message);
        const index = this.messages.findIndex((m) => regex.test(m));
        if (index !== -1) {
            const messages = this.messages.join("\n\t");
            fail(
                `Expected "${message}" to not be logged. The logged messages were:\n\t${messages}`,
            );
        }
    }

    expectNoOtherMessages({ ignoreDebug } = { ignoreDebug: true }) {
        const messages = ignoreDebug
            ? this.messages.filter((msg) => !msg.startsWith("debug"))
            : this.messages;

        ok(
            messages.length === 0,
            `Expected no other messages to be logged. The logged messages were:\n\t${this.messages.join(
                "\n\t",
            )}`,
        );
    }

    override diagnostic(diagnostic: ts.Diagnostic): void {
        const output = ts.formatDiagnostic(diagnostic, {
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

    override log(message: string, level: LogLevel): void {
        super.log(message, level);
        this.messages.push(levelMap[level] + message);
    }
}

function createRegex(s: string) {
    return new RegExp(
        [
            "^",
            s.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[\\s\\S]*"),
            "$",
        ].join(""),
    );
}
