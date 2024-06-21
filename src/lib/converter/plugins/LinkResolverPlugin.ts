import { Component, ConverterComponent } from "../components";
import type { Context } from "../../converter";
import { ConverterEvents } from "../converter-events";
import { Option, type ValidationOptions } from "../../utils";
import {
    ContainerReflection,
    DeclarationReflection,
    makeRecursiveVisitor,
    type ProjectReflection,
    type Reflection,
    type ReflectionCategory,
} from "../../models";
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
            if (reflection.comment) {
                this.owner.resolveLinks(reflection.comment, reflection);
            }

            if (reflection.isDeclaration()) {
                reflection.type?.visit(
                    makeRecursiveVisitor({
                        union: (type) => {
                            type.elementSummaries = type.elementSummaries?.map(
                                (parts) =>
                                    this.owner.resolveLinks(parts, reflection),
                            );
                        },
                    }),
                );
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

            if (reflection instanceof ContainerReflection) {
                if (reflection.groups) {
                    for (const group of reflection.groups) {
                        if (group.description) {
                            group.description = this.owner.resolveLinks(
                                group.description,
                                reflection,
                            );
                        }

                        if (group.categories) {
                            for (const cat of group.categories) {
                                this.resolveCategoryLinks(cat, reflection);
                            }
                        }
                    }
                }

                if (reflection.categories) {
                    for (const cat of reflection.categories) {
                        this.resolveCategoryLinks(cat, reflection);
                    }
                }
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
                        type.externalUrl = resolveResult;
                        break;
                    case "object":
                        type.externalUrl = resolveResult.target;
                        break;
                }
            }
        }
    }

    private resolveCategoryLinks(
        category: ReflectionCategory,
        owner: Reflection,
    ) {
        if (category.description) {
            category.description = this.owner.resolveLinks(
                category.description,
                owner,
            );
        }
    }
}
