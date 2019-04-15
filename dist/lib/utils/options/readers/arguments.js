"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const component_1 = require("../../component");
const options_1 = require("../options");
const declaration_1 = require("../declaration");
var CharacterCodes;
(function (CharacterCodes) {
    CharacterCodes[CharacterCodes["space"] = 32] = "space";
    CharacterCodes[CharacterCodes["doubleQuote"] = 34] = "doubleQuote";
    CharacterCodes[CharacterCodes["at"] = 64] = "at";
    CharacterCodes[CharacterCodes["minus"] = 45] = "minus";
})(CharacterCodes || (CharacterCodes = {}));
let ArgumentsReader = class ArgumentsReader extends options_1.OptionsComponent {
    initialize() {
        this.listenTo(this.owner, options_1.DiscoverEvent.DISCOVER, this.onDiscover, -200);
    }
    onDiscover(event) {
        if (this.application.isCLI) {
            this.parseArguments(event);
        }
    }
    parseArguments(event, passedArgs) {
        let index = 0;
        const owner = this.owner;
        const args = passedArgs || process.argv.slice(2);
        function readArgument(arg) {
            const declaration = owner.getDeclaration(arg);
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
        const files = [];
        while (index < args.length) {
            const arg = args[index++];
            if (arg.charCodeAt(0) === CharacterCodes.at) {
                this.parseResponseFile(event, arg.slice(1));
            }
            else if (arg.charCodeAt(0) === CharacterCodes.minus) {
                readArgument(arg.slice(arg.charCodeAt(1) === CharacterCodes.minus ? 2 : 1).toLowerCase());
            }
            else {
                files.push(arg);
            }
        }
        if (files && files.length > 0) {
            event.inputFiles = files;
        }
    }
    parseResponseFile(event, filename) {
        const text = ts.sys.readFile(filename);
        if (!text) {
            event.addError('File not found: "%s"', filename);
            return;
        }
        const args = [];
        let pos = 0;
        while (true) {
            while (pos < text.length && text.charCodeAt(pos) <= CharacterCodes.space) {
                pos++;
            }
            if (pos >= text.length) {
                break;
            }
            const start = pos;
            if (text.charCodeAt(start) === CharacterCodes.doubleQuote) {
                pos++;
                while (pos < text.length && text.charCodeAt(pos) !== CharacterCodes.doubleQuote) {
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
                while (text.charCodeAt(pos) > CharacterCodes.space) {
                    pos++;
                }
                args.push(text.substring(start, pos));
            }
        }
        this.parseArguments(event, args);
    }
};
ArgumentsReader = __decorate([
    component_1.Component({ name: 'options:arguments' })
], ArgumentsReader);
exports.ArgumentsReader = ArgumentsReader;
//# sourceMappingURL=arguments.js.map