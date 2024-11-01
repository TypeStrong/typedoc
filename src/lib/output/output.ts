import type { Application } from "../application.js";
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

    private defaultOutput = () => {
        return {
            name: "html",
            path: this.application.options.getValue("out"),
        };
    };

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

    setDefaultOutput(retriever: () => OutputSpecification) {
        this.defaultOutput = retriever;
    }

    async writeOutputs(project: ProjectReflection): Promise<void> {
        const options = this.application.options;

        let outputs: OutputSpecification[] = [];

        const outputShortcuts = options
            .getDeclarations()
            .filter(
                (decl) =>
                    decl.type === ParameterType.Path && decl.outputShortcut,
            );

        for (const shortcut of outputShortcuts) {
            if (options.isSet(shortcut.name as "out")) {
                outputs.push({
                    name: (shortcut as StringDeclarationOption).outputShortcut!,
                    path: options.getValue(shortcut.name as "out"),
                });
            }
        }

        if (outputs.length === 0) {
            outputs = options.getValue("outputs") || [];
        }

        if (!outputs.length) {
            outputs.push(this.defaultOutput.call(null));
        }

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
        await writer(output.path, project);

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
