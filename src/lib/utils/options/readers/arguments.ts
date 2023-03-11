import { ok } from "assert";
import type { OptionsReader, Options } from "..";
import type { Logger } from "../../loggers";
import { ParameterType } from "../declaration";

const ARRAY_OPTION_TYPES = new Set<ParameterType | undefined>([
    ParameterType.Array,
    ParameterType.PathArray,
    ParameterType.ModuleArray,
    ParameterType.GlobArray,
]);

/**
 * Obtains option values from command-line arguments
 */
export class ArgumentsReader implements OptionsReader {
    readonly name = "arguments";
    readonly order: number;
    readonly supportsPackages = false;
    private args: string[];

    constructor(priority: number, args = process.argv.slice(2)) {
        this.order = priority;
        this.args = args;
    }

    read(container: Options, logger: Logger): void {
        // Make container's type more lax, we do the appropriate checks manually.
        const options = container as Options & {
            setValue(name: string, value: unknown): void;
            getValue(name: string): unknown;
        };
        const seen = new Set<string>();
        let index = 0;

        const trySet = (name: string, value: unknown) => {
            try {
                options.setValue(name, value);
            } catch (err) {
                ok(err instanceof Error);
                logger.error(err.message);
            }
        };

        while (index < this.args.length) {
            const name = this.args[index];
            const decl = name.startsWith("-")
                ? (index++, options.getDeclaration(name.replace(/^--?/, "")))
                : options.getDeclaration("entryPoints");

            if (decl) {
                if (decl.configFileOnly) {
                    logger.error(
                        `The '${decl.name}' option can only be specified via a config file.`
                    );
                    continue;
                }

                if (seen.has(decl.name) && ARRAY_OPTION_TYPES.has(decl.type)) {
                    trySet(
                        decl.name,
                        (options.getValue(decl.name) as string[]).concat(
                            this.args[index]
                        )
                    );
                } else if (
                    decl.type === ParameterType.Boolean ||
                    decl.type === ParameterType.Flags
                ) {
                    const value = String(this.args[index]).toLowerCase();

                    if (value === "true" || value === "false") {
                        trySet(decl.name, value === "true");
                    } else {
                        trySet(decl.name, true);
                        // Bool option didn't consume the next argument as expected.
                        index--;
                    }
                } else {
                    if (index === this.args.length) {
                        // Only boolean values have optional values.
                        logger.warn(
                            `--${decl.name} expected a value, but none was given as an argument`
                        );
                    }
                    trySet(decl.name, this.args[index]);
                }
                seen.add(decl.name);
                index++;
                continue;
            }

            if (name.includes(".")) {
                const actualName = name.split(".")[0].replace(/^--?/, "");
                const decl = options.getDeclaration(actualName);

                if (decl && decl.type === ParameterType.Flags) {
                    const flagName = name.split(".", 2)[1];
                    const value = String(this.args[index]).toLowerCase();

                    if (value === "true" || value === "false") {
                        trySet(decl.name, { [flagName]: value === "true" });
                    } else {
                        trySet(decl.name, { [flagName]: true });
                        // Bool option didn't consume the next argument as expected.
                        index--;
                    }

                    index++;
                    continue;
                }
            }

            logger.error(
                `Unknown option: ${name}, you may have meant:\n\t${options
                    .getSimilarOptions(name)
                    .join("\n\t")}`
            );
            index++;
        }
    }
}
