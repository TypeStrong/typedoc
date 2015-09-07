var Logger_1 = require("./Logger");
var Util = require("util");
var Path = require("path");
var FS = require("fs");
(function (ModuleKind) {
    ModuleKind[ModuleKind["None"] = 0] = "None";
    ModuleKind[ModuleKind["CommonJS"] = 1] = "CommonJS";
    ModuleKind[ModuleKind["AMD"] = 2] = "AMD";
})(exports.ModuleKind || (exports.ModuleKind = {}));
var ModuleKind = exports.ModuleKind;
(function (ScriptTarget) {
    ScriptTarget[ScriptTarget["ES3"] = 0] = "ES3";
    ScriptTarget[ScriptTarget["ES5"] = 1] = "ES5";
    ScriptTarget[ScriptTarget["ES6"] = 2] = "ES6";
    ScriptTarget[ScriptTarget["Latest"] = 2] = "Latest";
})(exports.ScriptTarget || (exports.ScriptTarget = {}));
var ScriptTarget = exports.ScriptTarget;
(function (SourceFileMode) {
    SourceFileMode[SourceFileMode["File"] = 0] = "File";
    SourceFileMode[SourceFileMode["Modules"] = 1] = "Modules";
})(exports.SourceFileMode || (exports.SourceFileMode = {}));
var SourceFileMode = exports.SourceFileMode;
(function (ParameterHint) {
    ParameterHint[ParameterHint["File"] = 0] = "File";
    ParameterHint[ParameterHint["Directory"] = 1] = "Directory";
})(exports.ParameterHint || (exports.ParameterHint = {}));
var ParameterHint = exports.ParameterHint;
(function (ParameterType) {
    ParameterType[ParameterType["String"] = 0] = "String";
    ParameterType[ParameterType["Number"] = 1] = "Number";
    ParameterType[ParameterType["Boolean"] = 2] = "Boolean";
    ParameterType[ParameterType["Map"] = 3] = "Map";
})(exports.ParameterType || (exports.ParameterType = {}));
var ParameterType = exports.ParameterType;
(function (ParameterScope) {
    ParameterScope[ParameterScope["TypeDoc"] = 0] = "TypeDoc";
    ParameterScope[ParameterScope["TypeScript"] = 1] = "TypeScript";
})(exports.ParameterScope || (exports.ParameterScope = {}));
var ParameterScope = exports.ParameterScope;
var OptionsParser = (function () {
    function OptionsParser(application) {
        this.inputFiles = [];
        this.arguments = {};
        this.shortNames = {};
        this.application = application;
        this.addDefaultParameters();
        this.addCompilerParameters();
    }
    OptionsParser.prototype.addParameter = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        args.forEach(function (param) {
            if (Util.isArray(param)) {
                _this.addParameter.apply(_this, param);
                return;
            }
            param.type = param.type || ParameterType.String;
            param.scope = param.scope || ParameterScope.TypeDoc;
            _this.arguments[param.name.toLowerCase()] = param;
            if (param.short) {
                _this.shortNames[param.short.toLowerCase()] = param.name;
            }
            if (param.defaultValue && !param.isArray) {
                var name = param.name;
                var target = (param.scope == ParameterScope.TypeDoc) ? _this.application.options : _this.application.compilerOptions;
                if (!target[name]) {
                    target[name] = param.defaultValue;
                }
            }
        });
        return this;
    };
    OptionsParser.prototype.addCommandLineParameters = function () {
        this.addParameter({
            name: 'out',
            help: 'Specifies the location the documentation should be written to.',
            hint: ParameterHint.Directory
        }, {
            name: 'json',
            help: 'Specifies the location and file name a json file describing the project is written to.',
            hint: ParameterHint.File
        }, {
            name: 'version',
            short: 'v',
            help: 'Print the TypeDoc\'s version.',
            type: ParameterType.Boolean
        }, {
            name: 'help',
            short: 'h',
            help: 'Print this message.',
            type: ParameterType.Boolean
        });
    };
    OptionsParser.prototype.addDefaultParameters = function () {
        this.addParameter({
            name: 'theme',
            help: 'Specify the path to the theme that should be used or \'default\' or \'minimal\' to use built-in themes.',
            type: ParameterType.String
        }, {
            name: OptionsParser.OPTIONS_KEY,
            help: 'Specify a js option file that should be loaded. If not specified TypeDoc will look for \'typedoc.js\' in the current directory.',
            type: ParameterType.String,
            hint: ParameterHint.File
        }, {
            name: 'exclude',
            help: 'Define a pattern for excluded files when specifying paths.',
            type: ParameterType.String
        }, {
            name: 'ignoreCompilerErrors',
            help: 'Should TypeDoc generate documentation pages even after the compiler has returned errors?',
            type: ParameterType.Boolean
        }, {
            name: 'plugin',
            help: 'Specify the npm plugins that should be loaded. Omit to load all installed plugins, set to \'none\' to load no plugins.',
            type: ParameterType.String,
            isArray: true
        }, {
            name: 'verbose',
            help: 'Should TypeDoc print additional debug information?',
            type: ParameterType.Boolean
        }, {
            name: 'logger',
            help: 'Specify the logger that should be used, \'none\' or \'console\'',
            defaultValue: Logger_1.LoggerType.Console,
            type: ParameterType.Map,
            map: {
                'none': Logger_1.LoggerType.None,
                'console': Logger_1.LoggerType.Console
            },
            convert: function (param, value) {
                if (typeof value == 'function') {
                    return value;
                }
                else {
                    return OptionsParser.convert(param, value);
                }
            }
        });
    };
    OptionsParser.prototype.addCompilerParameters = function () {
        var _this = this;
        var ignored = OptionsParser.IGNORED_TS_PARAMS;
        ts.optionDeclarations.forEach(function (option) {
            if (ignored.indexOf(option.name) != -1)
                return;
            var param = {
                name: option.name,
                short: option.shortName,
                help: option.description ? option.description.key : null,
                scope: ParameterScope.TypeScript
            };
            switch (option.type) {
                case "number":
                    param.type = ParameterType.Number;
                    break;
                case "boolean":
                    param.type = ParameterType.Boolean;
                    break;
                case "string":
                    param.type = ParameterType.String;
                    break;
                default:
                    param.type = ParameterType.Map;
                    param.map = option.type;
                    if (option.error) {
                        var error = ts.createCompilerDiagnostic(option.error);
                        param.mapError = ts.flattenDiagnosticMessageText(error.messageText, ', ');
                    }
            }
            switch (option.paramType) {
                case ts.Diagnostics.FILE:
                    param.hint = ParameterHint.File;
                    break;
                case ts.Diagnostics.DIRECTORY:
                    param.hint = ParameterHint.Directory;
                    break;
            }
            _this.addParameter(param);
        });
    };
    OptionsParser.prototype.addInputFile = function (fileName) {
        this.inputFiles.push(fileName);
    };
    OptionsParser.prototype.getParameter = function (name) {
        name = name.toLowerCase();
        if (ts.hasProperty(this.shortNames, name)) {
            name = this.shortNames[name];
        }
        if (ts.hasProperty(this.arguments, name)) {
            return this.arguments[name];
        }
        else {
            return null;
        }
    };
    OptionsParser.prototype.getParametersByScope = function (scope) {
        var parameters = [];
        for (var key in this.arguments) {
            if (!this.arguments.hasOwnProperty(key))
                continue;
            var argument = this.arguments[key];
            if (argument.scope === scope) {
                parameters.push(argument);
            }
        }
        return parameters;
    };
    OptionsParser.prototype.setOption = function (param, value) {
        var _this = this;
        if (param.isArray && Util.isArray(value)) {
            var result = true;
            value.forEach(function (value) { return result = _this.setOption(param, value) && result; });
            return result;
        }
        try {
            if (param.convert) {
                value = param.convert(param, value);
            }
            else {
                value = OptionsParser.convert(param, value);
            }
        }
        catch (error) {
            this.application.logger.error(error.message);
            return false;
        }
        var name = param.name;
        var target = (param.scope == ParameterScope.TypeDoc) ? this.application.options : this.application.compilerOptions;
        if (param.isArray) {
            (target[name] = target[name] || []).push(value);
        }
        else {
            target[name] = value;
        }
        return true;
    };
    OptionsParser.prototype.loadOptionFileFromArguments = function (args, ignoreUnknownArgs) {
        args = args || process.argv.slice(2);
        var index = 0;
        var optionFile;
        while (index < args.length) {
            var arg = args[index++];
            if (arg.charCodeAt(0) !== 45) {
                continue;
            }
            arg = arg.slice(arg.charCodeAt(1) === 45 ? 2 : 1).toLowerCase();
            if (arg == OptionsParser.OPTIONS_KEY && args[index]) {
                optionFile = Path.resolve(args[index]);
                break;
            }
        }
        if (!optionFile) {
            optionFile = Path.resolve('typedoc.js');
            if (!FS.existsSync(optionFile)) {
                return true;
            }
        }
        return this.loadOptionFile(optionFile, ignoreUnknownArgs);
    };
    OptionsParser.prototype.loadOptionFileFromObject = function (obj, ignoreUnknownArgs) {
        if (typeof obj != 'object')
            return true;
        if (!obj[OptionsParser.OPTIONS_KEY]) {
            return true;
        }
        return this.loadOptionFile(obj[OptionsParser.OPTIONS_KEY], ignoreUnknownArgs);
    };
    OptionsParser.prototype.loadOptionFile = function (optionFile, ignoreUnknownArgs) {
        if (!FS.existsSync(optionFile)) {
            this.application.logger.error('The specified option file %s does not exist.', optionFile);
            return false;
        }
        var data = require(optionFile);
        if (typeof data == 'function') {
            data = data(this.application, td);
        }
        if (!(typeof data == 'object')) {
            this.application.logger.error('The option file %s could not be read, it must either export a function or an object.', optionFile);
            return false;
        }
        else {
            if (data.src) {
                if (typeof data.src == 'string') {
                    this.inputFiles = [data.src];
                }
                else if (Util.isArray(data.src)) {
                    this.inputFiles = data.src;
                }
                else {
                    this.application.logger.error('The property \'src\' of the option file %s must be a string or an array.', optionFile);
                }
                delete data.src;
            }
            return this.parseObject(data, ignoreUnknownArgs);
        }
    };
    OptionsParser.prototype.parseObject = function (obj, ignoreUnknownArgs) {
        if (typeof obj != 'object')
            return true;
        var logger = this.application.logger;
        var result = true;
        for (var key in obj) {
            if (!obj.hasOwnProperty(key))
                continue;
            var parameter = this.getParameter(key);
            if (!parameter) {
                if (!ignoreUnknownArgs) {
                    logger.error('Unknown option: %s', key);
                    result = false;
                }
            }
            else {
                result = this.setOption(parameter, obj[key]) && result;
            }
        }
        return result;
    };
    OptionsParser.prototype.parseArguments = function (args, ignoreUnknownArgs) {
        var index = 0;
        var result = true;
        var logger = this.application.logger;
        args = args || process.argv.slice(2);
        while (index < args.length) {
            var arg = args[index++];
            if (arg.charCodeAt(0) === 64) {
                result = this.parseResponseFile(arg.slice(1), ignoreUnknownArgs) && result;
            }
            else if (arg.charCodeAt(0) === 45) {
                arg = arg.slice(arg.charCodeAt(1) === 45 ? 2 : 1).toLowerCase();
                var parameter = this.getParameter(arg);
                if (!parameter) {
                    if (ignoreUnknownArgs)
                        continue;
                    logger.error('Unknown option: %s', arg);
                    return false;
                }
                else if (parameter.type !== ParameterType.Boolean) {
                    if (!args[index]) {
                        if (ignoreUnknownArgs)
                            continue;
                        logger.error('Option "%s" expects an argument', parameter.name);
                        return false;
                    }
                    else {
                        result = this.setOption(parameter, args[index++]) && result;
                    }
                }
                else {
                    result = this.setOption(parameter, true) && result;
                }
            }
            else if (!ignoreUnknownArgs) {
                this.addInputFile(arg);
            }
        }
        return result;
    };
    OptionsParser.prototype.parseResponseFile = function (filename, ignoreUnknownArgs) {
        var text = ts.sys.readFile(filename);
        var logger = this.application.logger;
        if (!text) {
            logger.error('File not found: "%s"', filename);
            return false;
        }
        var args = [];
        var pos = 0;
        while (true) {
            while (pos < text.length && text.charCodeAt(pos) <= 32)
                pos++;
            if (pos >= text.length)
                break;
            var start = pos;
            if (text.charCodeAt(start) === 34) {
                pos++;
                while (pos < text.length && text.charCodeAt(pos) !== 34)
                    pos++;
                if (pos < text.length) {
                    args.push(text.substring(start + 1, pos));
                    pos++;
                }
                else {
                    logger.error('Unterminated quoted string in response file "%s"', filename);
                    return false;
                }
            }
            else {
                while (text.charCodeAt(pos) > 32)
                    pos++;
                args.push(text.substring(start, pos));
            }
        }
        return this.parseArguments(args, ignoreUnknownArgs);
    };
    OptionsParser.prototype.getParameterHelp = function (scope) {
        var parameters = this.getParametersByScope(scope);
        parameters.sort(function (a, b) {
            return ts.compareValues(a.name.toLowerCase(), b.name.toLowerCase());
        });
        var names = [];
        var helps = [];
        var margin = 0;
        for (var i = 0; i < parameters.length; i++) {
            var parameter = parameters[i];
            if (!parameter.help)
                continue;
            var name = " ";
            if (parameter.short) {
                name += "-" + parameter.short;
                if (typeof parameter.hint != 'undefined') {
                    name += ' ' + ParameterHint[parameter.hint].toUpperCase();
                }
                name += ", ";
            }
            name += "--" + parameter.name;
            if (parameter.hint)
                name += ' ' + ParameterHint[parameter.hint].toUpperCase();
            names.push(name);
            helps.push(parameter.help);
            margin = Math.max(name.length, margin);
        }
        return { names: names, helps: helps, margin: margin };
    };
    OptionsParser.prototype.toString = function () {
        var typeDoc = this.getParameterHelp(ParameterScope.TypeDoc);
        var typeScript = this.getParameterHelp(ParameterScope.TypeScript);
        var margin = Math.max(typeDoc.margin, typeScript.margin);
        var output = [];
        output.push('Usage:');
        output.push(' typedoc --mode modules --out path/to/documentation path/to/sourcefiles');
        output.push('', 'TypeDoc options:');
        pushHelp(typeDoc);
        output.push('', 'TypeScript options:');
        pushHelp(typeScript);
        output.push('');
        return output.join(ts.sys.newLine);
        function pushHelp(columns) {
            for (var i = 0; i < columns.names.length; i++) {
                var usage = columns.names[i];
                var description = columns.helps[i];
                output.push(usage + padding(margin - usage.length + 2) + description);
            }
        }
        function padding(length) {
            return Array(length + 1).join(" ");
        }
    };
    OptionsParser.convert = function (param, value) {
        switch (param.type) {
            case ParameterType.Number:
                value = parseInt(value);
                break;
            case ParameterType.Boolean:
                value = (typeof value == 'undefined' ? true : !!value);
                break;
            case ParameterType.String:
                value = value || "";
                break;
            case ParameterType.Map:
                var map = param.map;
                var key = value ? (value + "").toLowerCase() : '';
                if (ts.hasProperty(map, key)) {
                    value = map[key];
                }
                else if (param.mapError) {
                    throw new Error(param.mapError);
                }
                else {
                    throw new Error(Util.format('Invalid option given for option "%s".', param.name));
                }
                break;
        }
        return value;
    };
    OptionsParser.createOptions = function () {
        return {
            theme: 'default'
        };
    };
    OptionsParser.createCompilerOptions = function () {
        return {
            target: 0,
            module: 0
        };
    };
    OptionsParser.IGNORED_TS_PARAMS = [
        'out', 'outDir', 'version', 'help',
        'watch', 'declaration', 'mapRoot',
        'sourceMap', 'removeComments'
    ];
    OptionsParser.OPTIONS_KEY = 'options';
    return OptionsParser;
})();
exports.OptionsParser = OptionsParser;
