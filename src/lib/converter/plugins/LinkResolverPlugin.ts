import { ConverterComponent } from "../components.js";
import type { Context, Converter } from "../../converter/index.js";
import { ConverterEvents } from "../converter-events.js";
import { Option, type ValidationOptions } from "../../utils/index.js";
import {
    ContainerReflection,
    makeRecursiveVisitor,
    type ProjectReflection,
    type Reflection,
    type ReflectionCategory,
} from "../../models/index.js";
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

                if (reflection.readme) {
                    reflection.readme = this.owner.resolveLinks(
                        reflection.readme,
                        reflection,
                    );
                }
            }

            if (reflection.isDocument()) {
                reflection.content = this.owner.resolveLinks(
                    reflection.content,
                    reflection,
                );
            }

            if (
                reflection.isParameter() &&
                reflection.type?.type === "reference" &&
                reflection.type.highlightedProperties
            ) {
                const resolved = new Map(
                    Array.from(
                        reflection.type.highlightedProperties,
                        ([name, parts]) => {
                            return [
                                name,
                                this.owner.resolveLinks(parts, reflection),
                            ];
                        },
                    ),
                );

                reflection.type.highlightedProperties = resolved;
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
