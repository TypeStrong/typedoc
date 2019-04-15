"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const Util = require("util");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Verbose"] = 0] = "Verbose";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
    LogLevel[LogLevel["Success"] = 4] = "Success";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class Logger {
    constructor() {
        this.errorCount = 0;
    }
    hasErrors() {
        return this.errorCount > 0;
    }
    resetErrors() {
        this.errorCount = 0;
    }
    write(text, ...args) {
        this.log(Util.format.apply(this, arguments), LogLevel.Info);
    }
    writeln(text, ...args) {
        this.log(Util.format.apply(this, arguments), LogLevel.Info, true);
    }
    success(text, ...args) {
        this.log(Util.format.apply(this, arguments), LogLevel.Success);
    }
    verbose(text, ...args) {
        this.log(Util.format.apply(this, arguments), LogLevel.Verbose);
    }
    warn(text, ...args) {
        this.log(Util.format.apply(this, arguments), LogLevel.Warn);
    }
    error(text, ...args) {
        this.log(Util.format.apply(this, arguments), LogLevel.Error);
    }
    log(message, level = LogLevel.Info, newLine) {
        if (level === LogLevel.Error) {
            this.errorCount += 1;
        }
    }
    diagnostics(diagnostics) {
        diagnostics.forEach((diagnostic) => {
            this.diagnostic(diagnostic);
        });
    }
    diagnostic(diagnostic) {
        let output;
        if (diagnostic.file) {
            output = diagnostic.file.fileName;
            output += '(' + ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start || 0).line + ')';
            output += ts.sys.newLine + ' ' + ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine);
        }
        else {
            output = ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine);
        }
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
exports.Logger = Logger;
class ConsoleLogger extends Logger {
    log(message, level = LogLevel.Info, newLine) {
        if (level === LogLevel.Error) {
            this.errorCount += 1;
        }
        let output = '';
        if (level === LogLevel.Error) {
            output += 'Error: ';
        }
        if (level === LogLevel.Warn) {
            output += 'Warning: ';
        }
        output += message;
        if (newLine || level === LogLevel.Success) {
            ts.sys.write(ts.sys.newLine);
        }
        ts.sys.write(output + ts.sys.newLine);
        if (level === LogLevel.Success) {
            ts.sys.write(ts.sys.newLine);
        }
    }
}
exports.ConsoleLogger = ConsoleLogger;
class CallbackLogger extends Logger {
    constructor(callback) {
        super();
        this.callback = callback;
    }
    log(message, level = LogLevel.Info, newLine) {
        if (level === LogLevel.Error) {
            this.errorCount += 1;
        }
        this.callback(message, level, newLine);
    }
}
exports.CallbackLogger = CallbackLogger;
//# sourceMappingURL=loggers.js.map