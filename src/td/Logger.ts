module td
{
    /**
     * List of known log levels. Used to specify the urgency of a log message.
     */
    export enum LogLevel {
        Verbose,
        Info,
        Warn,
        Error,
        Success
    }


    export enum LoggerType {
        None,
        Console
    }


    /**
     * A logger that will not produce any output.
     *
     * This logger also serves as the ase calls of other loggers as it implements
     * all the required utility functions.
     */
    export class Logger
    {
        /**
         * How many error messages have been logged?
         */
        errorCount:number = 0;



        /**
         * Has an error been raised through the log method?
         */
        public hasErrors():boolean {
            return this.errorCount > 0;
        }


        /**
         * Reset the error counter.
         */
        public resetErrors() {
            this.errorCount = 0;
        }


        /**
         * Log the given message.
         *
         * @param text  The message that should be logged.
         * @param args  The arguments that should be printed into the given message.
         */
        public write(text:string, ...args:string[]) {
            this.log(Util.format.apply(this, arguments), LogLevel.Info);
        }


        /**
         * Log the given message with a trailing whitespace.
         *
         * @param text  The message that should be logged.
         * @param args  The arguments that should be printed into the given message.
         */
        public writeln(text:string, ...args:string[]) {
            this.log(Util.format.apply(this, arguments), LogLevel.Info, true);
        }


        /**
         * Log the given success message.
         *
         * @param text  The message that should be logged.
         * @param args  The arguments that should be printed into the given message.
         */
        public success(text:string, ...args:string[]) {
            this.log(Util.format.apply(this, arguments), LogLevel.Success);
        }


        /**
         * Log the given verbose message.
         *
         * @param text  The message that should be logged.
         * @param args  The arguments that should be printed into the given message.
         */
        public verbose(text:string, ...args:string[]) {
            this.log(Util.format.apply(this, arguments), LogLevel.Verbose);
        }


        /**
         * Log the given warning.
         *
         * @param text  The warning that should be logged.
         * @param args  The arguments that should be printed into the given warning.
         */
        public warn(text:string, ...args:string[]) {
            this.log(Util.format.apply(this, arguments), LogLevel.Warn);
        }


        /**
         * Log the given error.
         *
         * @param text  The error that should be logged.
         * @param args  The arguments that should be printed into the given error.
         */
        public error(text:string, ...args:string[]) {
            this.log(Util.format.apply(this, arguments), LogLevel.Error);
        }


        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level  The urgency of the log message.
         * @param newLine  Should the logger print a trailing whitespace?
         */
        public log(message:string, level:LogLevel = LogLevel.Info, newLine?:boolean) {
            if (level == LogLevel.Error) {
                this.errorCount += 1;
            }
        }


        /**
         * Print the given TypeScript log messages.
         *
         * @param diagnostics  The TypeScript messages that should be logged.
         */
        public diagnostics(diagnostics:ts.Diagnostic[]) {
            diagnostics.forEach((diagnostic) => {
                this.diagnostic(diagnostic);
            });
        }


        /**
         * Print the given TypeScript log message.
         *
         * @param diagnostic  The TypeScript message that should be logged.
         */
        public diagnostic(diagnostic:ts.Diagnostic) {
            var output;
            if (diagnostic.file) {
                output = diagnostic.file.fileName;
                output += '(' + ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start).line + ')';
                output += ts.sys.newLine + ' ' + diagnostic.messageText;
            } else {
                output = diagnostic.messageText;
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



    /**
     * A logger that outputs all messages to the console.
     */
    export class ConsoleLogger extends Logger
    {
        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level  The urgency of the log message.
         * @param newLine  Should the logger print a trailing whitespace?
         */
        public log(message:string, level:LogLevel = LogLevel.Info, newLine?:boolean) {
            if (level == LogLevel.Error) {
                this.errorCount += 1;
            }

            var output = '';
            if (level == LogLevel.Error) output += 'Error: ';
            if (level == LogLevel.Warn) output += 'Warning: ';
            output += message;

            if (newLine || level == LogLevel.Success) ts.sys.write(ts.sys.newLine);
            ts.sys.write(output + ts.sys.newLine);
            if (level == LogLevel.Success) ts.sys.write(ts.sys.newLine);
        }
    }



    /**
     * A logger that calls a callback function.
     */
    export class CallbackLogger extends Logger
    {
        /**
         * This loggers callback function
         */
        callback:Function;


        /**
         * Create a new CallbackLogger instance.
         *
         * @param callback  The callback that should be used to log messages.
         */
        constructor(callback:Function) {
            super();
            this.callback = callback;
        }


        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level  The urgency of the log message.
         * @param newLine  Should the logger print a trailing whitespace?
         */
        public log(message:string, level:LogLevel = LogLevel.Info, newLine?:boolean) {
            if (level == LogLevel.Error) {
                this.errorCount += 1;
            }

            this.callback(message, level, newLine);
        }
    }
}