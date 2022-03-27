import { Logger, LogLevel, removeIf } from "../lib/utils";
import { deepStrictEqual as equal, fail } from "assert";

const levelMap: Record<LogLevel, string> = {
    [LogLevel.Error]: "error: ",
    [LogLevel.Warn]: "warn: ",
    [LogLevel.Info]: "info: ",
    [LogLevel.Verbose]: "debug: ",
};

export class TestLogger extends Logger {
    messages: string[] = [];

    discardDebugMessages() {
        removeIf(this.messages, (msg) => msg.startsWith("debug"));
    }

    expectMessage(message: string) {
        const index = this.messages.indexOf(message);
        if (index === -1) {
            const messages = this.messages.join("\n\t") || "(none logged)";
            fail(
                `Expected "${message}" to be logged. The logged messages were:\n\t${messages}`
            );
        }
        this.messages.splice(index, 1);
    }

    expectNoOtherMessages() {
        equal(this.messages, [], "Expected no other messages to be logged.");
    }

    override log(message: string, level: LogLevel): void {
        super.log(message, level);
        this.messages.push(levelMap[level] + message);
    }
}
