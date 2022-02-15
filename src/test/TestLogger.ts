import { Logger, LogLevel } from "../lib/utils";
import { fail } from "assert";

const levelMap: Record<LogLevel, string> = {
    [LogLevel.Error]: "error: ",
    [LogLevel.Warn]: "warn: ",
    [LogLevel.Info]: "info: ",
    [LogLevel.Verbose]: "debug: ",
};

export class TestLogger extends Logger {
    messages: string[] = [];

    expectMessage(message: string) {
        if (!this.messages.includes(message)) {
            const messages = this.messages.join("\n\t");
            fail(
                `Expected "${message}" to be logged. The logged messages were:\n\t${messages}`
            );
        }
    }

    override log(message: string, level: LogLevel): void {
        this.messages.push(levelMap[level] + message);
    }
}
