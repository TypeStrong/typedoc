import { ConverterComponent } from "../components.js";
import type { Context, Converter } from "../../converter/index.js";
import { ConverterEvents } from "../converter-events.js";
import { Option, type ValidationOptions } from "../../utils/index.js";
import type { ProjectReflection } from "../../models/index.js";
import { discoverAllReferenceTypes } from "../../utils/reflections.js";
import { ApplicationEvents } from "../../application-events.js";

/**
 * A plugin that resolves `{@link Foo}` tags.
 */
export class LinkResolverPlugin extends ConverterComponent {
    @Option("validation")
    accessor validation!: ValidationOptions;

    constructor(owner: Converter) {
        super(owner);
        this.owner.on(
            ConverterEvents.RESOLVE_END,
            this.onResolve.bind(this),
            -300,
        );
        this.application.on(
            ApplicationEvents.REVIVE,
            this.resolveLinks.bind(this),
            -300,
        );
    }

    onResolve(context: Context) {
        this.resolveLinks(context.project);
    }

    resolveLinks(project: ProjectReflection) {
        for (const id in project.reflections) {
            const reflection = project.reflections[id];
            this.owner.resolveLinks(reflection);
        }

        for (
            const { type, owner } of discoverAllReferenceTypes(
                project,
                false,
            )
        ) {
            if (!type.reflection) {
                const resolveResult = this.owner.resolveExternalLink(
                    type.toDeclarationReference(),
                    owner,
                    undefined,
                    type.symbolId,
                );
                switch (typeof resolveResult) {
                    case "string":
                        type.externalUrl = resolveResult;
                        break;
                    case "object":
                        type.externalUrl = resolveResult.target;
                        break;
                }
            }
        }
    }
}
