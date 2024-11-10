import type { Application } from "../application.js";
import type { TranslatedString } from "../internationalization/index.js";
import type { ProjectReflection } from "../models/index.js";
import {
    ParameterType,
    type OutputSpecification,
    type StringDeclarationOption,
} from "../utils/options/declaration.js";
import { nicePath } from "../utils/paths.js";

export class Outputs {
    private outputs = new Map<
        string,
        (path: string, project: ProjectReflection) => Promise<void>
    >();

    private defaultOutput = "html";

    constructor(readonly application: Application) {}

    addOutput(
        name: string,
        output: (path: string, project: ProjectReflection) => Promise<void>,
    ) {
        if (this.outputs.has(name)) {
            throw new Error(`Output type '${name}' has already been defined`);
        }
        this.outputs.set(name, output);
    }

    setDefaultOutputName(name: string) {
        this.defaultOutput = name;
    }

    getOutputSpecs(): OutputSpecification[] {
        const options = this.application.options;

        let outputs: OutputSpecification[] = [];

        const outputShortcuts = options
            .getDeclarations()
            .filter(
                (decl) =>
                    decl.type === ParameterType.Path && decl.outputShortcut,
            );

        // --out is a special case. It isn't marked as a shortcut as what it is
        // a shortcut for may be modified by plugins. However, it is effectively
        // treated as an output shortcut, so check it here.
        if (options.isSet("out")) {
            outputs.push({
                name: this.defaultOutput,
                path: options.getValue("out"),
            });
        }
        for (const shortcut of outputShortcuts) {
            if (options.isSet(shortcut.name as "html")) {
                outputs.push({
                    name: (shortcut as StringDeclarationOption).outputShortcut!,
                    path: options.getValue(shortcut.name as "html"),
                });
            }
        }

        // If no shortcuts have been defined, use the dedicated outputs option
        if (outputs.length === 0) {
            outputs = options.getValue("outputs") || [];
        }

        // If no outputs have been defined, just write the default output.
        if (!outputs.length) {
            outputs.push({
                name: this.defaultOutput,
                path: options.getValue("out"),
            });
        }

        return outputs;
    }

    async writeOutputs(project: ProjectReflection): Promise<void> {
        const outputs = this.getOutputSpecs();

        for (const output of outputs) {
            await this.writeOutput(output, project);
        }
    }

    async writeOutput(output: OutputSpecification, project: ProjectReflection) {
        const options = this.application.options;
        const snap = options.snapshot();
        const writer = this.outputs.get(output.name);
        if (!writer) {
            this.application.logger.error(
                this.application.i18n.specified_output_0_has_not_been_defined(
                    output.name,
                ),
            );
            return;
        }

        if (!this.application.setOptions(output.options || {}, true)) {
            options.restore(snap);
            return;
        }

        const preErrors = this.application.logger.errorCount;

        const start = Date.now();
        try {
            await writer(output.path, project);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            this.application.logger.error(message as TranslatedString);
        }

        if (this.application.logger.errorCount === preErrors) {
            this.application.logger.info(
                this.application.i18n.output_0_generated_at_1(
                    output.name,
                    nicePath(output.path),
                ),
            );
        } else {
            this.application.logger.error(
                this.application.i18n.output_0_could_not_be_generated(
                    output.name,
                ),
            );
        }

        this.application.logger.verbose(
            `${output.name} took ${Date.now() - start}ms`,
        );

        options.restore(snap);
    }
}
