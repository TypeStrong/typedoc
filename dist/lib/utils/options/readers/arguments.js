"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var _ts = require("../../../ts-internal");
var component_1 = require("../../component");
var options_1 = require("../options");
var declaration_1 = require("../declaration");
var ArgumentsReader = (function (_super) {
    __extends(ArgumentsReader, _super);
    function ArgumentsReader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ArgumentsReader.prototype.initialize = function () {
        this.listenTo(this.owner, options_1.DiscoverEvent.DISCOVER, this.onDiscover, -200);
    };
    ArgumentsReader.prototype.onDiscover = function (event) {
        if (this.application.isCLI) {
            this.parseArguments(event);
        }
    };
    ArgumentsReader.prototype.parseArguments = function (event, args) {
        var index = 0;
        var owner = this.owner;
        args = args || process.argv.slice(2);
        function readArgument(arg) {
            var declaration = owner.getDeclaration(arg);
            if (!declaration) {
                event.addError('Unknown option: %s', arg);
            }
            else if (declaration.type !== declaration_1.ParameterType.Boolean) {
                if (!args[index]) {
                    event.addError('Option "%s" expects an argument', declaration.name);
                }
                else {
                    event.data[declaration.name] = args[index++];
                }
            }
            else {
                event.data[declaration.name] = true;
            }
        }
        var files = [];
        while (index < args.length) {
            var arg = args[index++];
            if (arg.charCodeAt(0) === _ts.CharacterCodes.at) {
                this.parseResponseFile(event, arg.slice(1));
            }
            else if (arg.charCodeAt(0) === _ts.CharacterCodes.minus) {
                readArgument(arg.slice(arg.charCodeAt(1) === _ts.CharacterCodes.minus ? 2 : 1).toLowerCase());
            }
            else {
                files.push(arg);
            }
        }
        if (files) {
            event.inputFiles = files;
        }
    };
    ArgumentsReader.prototype.parseResponseFile = function (event, filename) {
        var text = ts.sys.readFile(filename);
        if (!text) {
            event.addError('File not found: "%s"', filename);
            return;
        }
        var args = [];
        var pos = 0;
        while (true) {
            while (pos < text.length && text.charCodeAt(pos) <= _ts.CharacterCodes.space) {
                pos++;
            }
            if (pos >= text.length) {
                break;
            }
            var start = pos;
            if (text.charCodeAt(start) === _ts.CharacterCodes.doubleQuote) {
                pos++;
                while (pos < text.length && text.charCodeAt(pos) !== _ts.CharacterCodes.doubleQuote) {
                    pos++;
                }
                if (pos < text.length) {
                    args.push(text.substring(start + 1, pos));
                    pos++;
                }
                else {
                    event.addError('Unterminated quoted string in response file "%s"', filename);
                    return;
                }
            }
            else {
                while (text.charCodeAt(pos) > _ts.CharacterCodes.space) {
                    pos++;
                }
                args.push(text.substring(start, pos));
            }
        }
        this.parseArguments(event, args);
    };
    ArgumentsReader = __decorate([
        component_1.Component({ name: 'options:arguments' })
    ], ArgumentsReader);
    return ArgumentsReader;
}(options_1.OptionsComponent));
exports.ArgumentsReader = ArgumentsReader;
//# sourceMappingURL=arguments.js.map