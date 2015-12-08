import * as ts from "typescript";

import {Component} from "../../component";
import {DiscoverEvent, OptionsComponent} from "../options";
import {ParameterType} from "../declaration";


@Component({name:"options:arguments"})
export class ArgumentsReader extends OptionsComponent
{
    initialize() {
        this.listenTo(this.owner, DiscoverEvent.DISCOVER, this.onDiscover);
    }


    onDiscover(event:DiscoverEvent) {
        if (this.application.isCLI) {
            this.parseArguments(event);
        }
    }


    /**
     * Read and store the given list of arguments.
     *
     * @param args  The list of arguments that should be parsed. When omitted the
     *   current command line arguments will be used.
     * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
     *   will simply skip all unknown arguments.
     * @returns TRUE on success, otherwise FALSE.
     */
    private parseArguments(event:DiscoverEvent, args?:string[]) {
        var index = 0;
        var owner = this.owner;
        args = args || process.argv.slice(2);

        function readArgument(arg:string) {
            var declaration = owner.getDeclaration(arg);
            if (!declaration) {
                event.addError('Unknown option: %s', arg);
            } else if (declaration.type !== ParameterType.Boolean) {
                if (!args[index]) {
                    event.addError('Option "%s" expects an argument', declaration.name);
                } else {
                    event.data[declaration.name] = args[index++];
                }
            } else {
                event.data[declaration.name] = true;
            }
        }

        while (index < args.length) {
            var arg = args[index++];

            if (arg.charCodeAt(0) === ts.CharacterCodes.at) {
                this.parseResponseFile(event, arg.slice(1));
            } else if (arg.charCodeAt(0) === ts.CharacterCodes.minus) {
                readArgument(arg.slice(arg.charCodeAt(1) === ts.CharacterCodes.minus ? 2 : 1).toLowerCase());
            } else {
                event.addInputFile(arg);
            }
        }
    }


    /**
     * Read the arguments stored in the given file.
     *
     * @param filename  The path and filename that should be parsed.
     * @param ignoreUnknownArgs  Should unknown arguments be ignored?
     * @returns TRUE on success, otherwise FALSE.
     */
    private parseResponseFile(event:DiscoverEvent, filename:string) {
        var text = ts.sys.readFile(filename);
        if (!text) {
            event.addError('File not found: "%s"', filename);
            return;
        }

        var args:string[] = [];
        var pos = 0;
        while (true) {
            while (pos < text.length && text.charCodeAt(pos) <= ts.CharacterCodes.space) pos++;
            if (pos >= text.length) break;

            var start = pos;
            if (text.charCodeAt(start) === ts.CharacterCodes.doubleQuote) {
                pos++;
                while (pos < text.length && text.charCodeAt(pos) !== ts.CharacterCodes.doubleQuote) pos++;
                if (pos < text.length) {
                    args.push(text.substring(start + 1, pos));
                    pos++;
                } else {
                    event.addError('Unterminated quoted string in response file "%s"', filename);
                    return;
                }
            } else {
                while (text.charCodeAt(pos) > ts.CharacterCodes.space) pos++;
                args.push(text.substring(start, pos));
            }
        }

        this.parseArguments(event, args);
    }
}
