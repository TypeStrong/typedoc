import { OptionsReader, Options } from '..';
import { Logger } from '../../loggers';
import { ParameterType } from '../declaration';

/**
 * Obtains option values from command-line arguments
 */
export class ArgumentsReader implements OptionsReader {
    readonly name = 'arguments';
    readonly priority: number;
    private args: string[];

    constructor(priority: number, args = process.argv.slice(2)) {
        this.priority = priority;
        this.args = args;
    }

    read(container: Options, logger: Logger): void {
        const seen = new Set<string>();
        let index = 0;

        const error = (error: Error) => logger.error(error.message);

        while (index < this.args.length) {
            const name = this.args[index];
            const decl = name.startsWith('-')
                ? (index++, container.getDeclaration(name.replace(/^--?/, '')))
                : container.getDeclaration('inputFiles');

            if (decl) {
                if (seen.has(decl.name) && decl.type === ParameterType.Array) {
                    container.setValue(
                        decl.name,
                        (container.getValue(decl.name) as string[]).concat(this.args[index])
                    ).mapErr(error);
                } else if (decl.type === ParameterType.Boolean) {
                    const value = String(this.args[index]).toLowerCase();

                    if (value === 'true' || value === 'false') {
                        container.setValue(decl.name, value === 'true').mapErr(error);
                    } else {
                        container.setValue(decl.name, true).mapErr(error);
                        // Bool option didn't consume the next argument as expected.
                        index--;
                    }
                } else {
                    container.setValue(decl.name, this.args[index]).mapErr(error);
                }
                seen.add(decl.name);
            } else {
                logger.error(`Unknown option: ${name}`);
            }

            index++;
        }
    }
}
