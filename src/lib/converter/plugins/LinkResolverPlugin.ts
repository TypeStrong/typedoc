import { Component, ConverterComponent } from "../components";
import type { Context, ExternalResolveResult } from "../../converter";
import { ConverterEvents } from "../converter-events";
import { BindOption, ValidationOptions } from "../../utils";
import { DeclarationReflection, ProjectReflection } from "../../models";
import { discoverAllReferenceTypes } from "../../utils/reflections";
import { ApplicationEvents } from "../../application-events";

/**
 * A plugin that resolves `{@link Foo}` tags.
 */
@Component({ name: "link-resolver" })
export class LinkResolverPlugin extends ConverterComponent {
    @BindOption("validation")
    validation!: ValidationOptions;

    override initialize() {
        super.initialize();
        this.owner.on(ConverterEvents.RESOLVE_END, this.onResolve, this, -300);
        this.application.on(
            ApplicationEvents.REVIVE,
            this.resolveLinks,
            this,
            -300
        );
    }

    onResolve(context: Context) {
        this.resolveLinks(context.project);
    }

    resolveLinks(project: ProjectReflection) {
        for (const reflection of Object.values(project.reflections)) {
            if (reflection.comment) {
                this.owner.resolveLinks(reflection.comment, reflection);
            }

            if (
                reflection instanceof DeclarationReflection &&
                reflection.readme
            ) {
                reflection.readme = this.owner.resolveLinks(
                    reflection.readme,
                    reflection
                );
            }
        }

        if (project.readme) {
            project.readme = this.owner.resolveLinks(project.readme, project);
        }

        for (const { type, owner } of discoverAllReferenceTypes(
            project,
            false
        )) {
            if (!type.reflection) {
                const resolveResult = this.owner.resolveExternalLink(
                    type.toDeclarationReference(),
                    owner
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
