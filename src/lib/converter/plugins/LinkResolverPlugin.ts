import { Component, ConverterComponent } from "../components";
import type { Context, ExternalResolveResult } from "../../converter";
import { ConverterEvents } from "../converter-events";
import { Option, ValidationOptions } from "../../utils";
import { DeclarationReflection, ProjectReflection } from "../../models";
import { discoverAllReferenceTypes } from "../../utils/reflections";
import { ApplicationEvents } from "../../application-events";

/**
 * A plugin that resolves `{@link Foo}` tags.
 */
@Component({ name: "link-resolver" })
export class LinkResolverPlugin extends ConverterComponent {
    @Option("validation")
    accessor validation!: ValidationOptions;

    override initialize() {
        super.initialize();
        this.owner.on(ConverterEvents.RESOLVE_END, this.onResolve, this, -300);
        this.application.on(
            ApplicationEvents.REVIVE,
            this.resolveLinks,
            this,
            -300,
        );
    }

    onResolve(context: Context) {
        this.resolveLinks(context.project);
    }

    resolveLinks(project: ProjectReflection) {
        for (const id in project.reflections) {
            const reflection = project.reflections[id];
            if (reflection.comment) {
                this.owner.resolveLinks(reflection.comment, reflection);
            }

            if (
                reflection instanceof DeclarationReflection &&
                reflection.readme
            ) {
                reflection.readme = this.owner.resolveLinks(
                    reflection.readme,
                    reflection,
                );
            }
        }

        if (project.readme) {
            project.readme = this.owner.resolveLinks(project.readme, project);
        }

        for (const { type, owner } of discoverAllReferenceTypes(
            project,
            false,
        )) {
            if (!type.reflection) {
                const resolveResult = this.owner.resolveExternalLink(
                    type.toDeclarationReference(),
                    owner,
                    undefined,
                    type.symbolId,
                );
                switch (typeof resolveResult) {
                    case "string":
                        type.externalUrl = resolveResult as string;
                        break;
                    case "object":
                        type.externalUrl = (
                            resolveResult as ExternalResolveResult
                        ).target;
                        break;
                }
            }
        }
    }
}
