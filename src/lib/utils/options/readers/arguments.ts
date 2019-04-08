import * as ts from 'typescript';
import * as _ts from '../../../ts-internal';

import { Component } from '../../component';
import { DiscoverEvent, OptionsComponent } from '../options';
import { ParameterType } from '../declaration';

/**
 * ASCII Values
 * https://www.ascii-code.com/
 */
enum CharacterCodes {
    space = 0x20,
    doubleQuote = 0x22,
    at = 0x40,
    minus = 0x2d
}

/**
 * Obtains option values from command-line arguments
 */
@Component({name: 'options:arguments'})
export class ArgumentsReader extends OptionsComponent {
    initialize() {
        this.listenTo(this.owner, DiscoverEvent.DISCOVER, this.onDiscover, -200);
    }

    onDiscover(event: DiscoverEvent) {
        if (this.application.isCLI) {
            this.parseArguments(event);
        }
    }

    /**
     * Read and store the given list of arguments.
     *
     * @param passedArgs  The list of arguments that should be parsed. When omitted the
     *   current command line arguments will be used.
     * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
     *   will simply skip all unknown arguments.
     * @returns TRUE on success, otherwise FALSE.
     */
    private parseArguments(event: DiscoverEvent, passedArgs?: string[]) {
        let index = 0;
        const owner = this.owner;
        const args = passedArgs || process.argv.slice(2);

        function readArgument(arg: string) {
            const declaration = owner.getDeclaration(arg);
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

        const files: string[] = [];
        while (index < args.length) {
            const arg = args[index++];

            if (arg.charCodeAt(0) === CharacterCodes.at) {
                this.parseResponseFile(event, arg.slice(1));
            } else if (arg.charCodeAt(0) === CharacterCodes.minus) {
                readArgument(arg.slice(arg.charCodeAt(1) === CharacterCodes.minus ? 2 : 1).toLowerCase());
            } else {
                files.push(arg);
            }
        }
        if (files && files.length > 0) {
            event.inputFiles = files;
        }
    }

    /**
     * Read the arguments stored in the given file.
     *
     * @param filename  The path and filename that should be parsed.
     * @param ignoreUnknownArgs  Should unknown arguments be ignored?
     * @returns TRUE on success, otherwise FALSE.
     */
    private parseResponseFile(event: DiscoverEvent, filename: string) {
        const text = ts.sys.readFile(filename);
        if (!text) {
            event.addError('File not found: "%s"', filename);
            return;
        }

        const args: string[] = [];
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
                } else {
                    event.addError('Unterminated quoted string in response file "%s"', filename);
                    return;
                }
            } else {
                while (text.charCodeAt(pos) > CharacterCodes.space) {
                    pos++;
                }
                args.push(text.substring(start, pos));
            }
        }

        this.parseArguments(event, args);
    }
}
