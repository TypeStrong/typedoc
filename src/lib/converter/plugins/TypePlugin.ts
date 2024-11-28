import {
    ReflectionKind,
    DeclarationReflection,
    type DeclarationHierarchy,
    type ProjectReflection,
    type Reflection,
} from "../../models/reflections/index.js";
import { type SomeType, type Type, ReferenceType } from "../../models/types.js";
import { ConverterComponent } from "../components.js";
import type { Context } from "../context.js";
import { ApplicationEvents } from "../../application-events.js";
import { ConverterEvents } from "../converter-events.js";
import type { Converter } from "../converter.js";

/**
 * Responsible for adding `implementedBy` / `implementedFrom`
 */
export class TypePlugin extends ConverterComponent {
    reflections = new Set<DeclarationReflection>();

    constructor(owner: Converter) {
        super(owner);
        this.owner.on(ConverterEvents.RESOLVE, this.onResolve.bind(this));
        this.owner.on(
            ConverterEvents.RESOLVE_END,
            this.onResolveEnd.bind(this),
        );
        this.owner.on(ConverterEvents.END, () => this.reflections.clear());
        this.application.on(
            ApplicationEvents.REVIVE,
            this.onRevive.bind(this),
            100,
        );
    }

    private onRevive(project: ProjectReflection) {
        for (const id in project.reflections) {
            this.resolve(project, project.reflections[id]);
        }
        this.finishResolve(project);
        this.reflections.clear();
    }

    private onResolve(context: Context, reflection: Reflection) {
        this.resolve(context.project, reflection);
    }

    private resolve(project: ProjectReflection, reflection: Reflection) {
        if (!(reflection instanceof DeclarationReflection)) return;

        if (reflection.kindOf(ReflectionKind.ClassOrInterface)) {
            this.postpone(reflection);

            walk(reflection.implementedTypes, (target) => {
                this.postpone(target);
                target.implementedBy ||= [];

                if (
                    !target.implementedBy.some(
                        (t) => t.reflection === reflection,
                    )
                ) {
                    target.implementedBy.push(
                        ReferenceType.createResolvedReference(
                            reflection.name,
                            reflection,
                            project,
                        ),
                    );
                }
            });

            walk(reflection.extendedTypes, (target) => {
                this.postpone(target);
                target.extendedBy ||= [];

                if (
                    !target.extendedBy.some((t) => t.reflection === reflection)
                ) {
                    target.extendedBy.push(
                        ReferenceType.createResolvedReference(
                            reflection.name,
                            reflection,
                            project,
                        ),
                    );
                }
            });
        }

        function walk(
            types: Type[] | undefined,
            callback: { (declaration: DeclarationReflection): void },
        ) {
            if (!types) {
                return;
            }
            types.forEach((type) => {
                if (!(type instanceof ReferenceType)) {
                    return;
                }
                if (
                    !type.reflection ||
                    !(type.reflection instanceof DeclarationReflection)
                ) {
                    return;
                }
                callback(type.reflection);
            });
        }
    }

    private postpone(reflection: DeclarationReflection) {
        this.reflections.add(reflection);
    }

    private onResolveEnd(context: Context) {
        this.finishResolve(context.project);
    }

    private finishResolve(project: ProjectReflection) {
        this.reflections.forEach((reflection) => {
            if (reflection.implementedBy) {
                reflection.implementedBy.sort((a, b) => {
                    if (a.name === b.name) {
                        return 0;
                    }
                    return a.name > b.name ? 1 : -1;
                });
            }

            let root: DeclarationHierarchy | undefined;
            let hierarchy: DeclarationHierarchy | undefined;
            function push(types: SomeType[]) {
                const level: DeclarationHierarchy = { types: types };
                if (hierarchy) {
                    hierarchy.next = level;
                    hierarchy = level;
                } else {
                    root = hierarchy = level;
                }
            }

            if (reflection.extendedTypes) {
                push(reflection.extendedTypes);
            }

            push([
                ReferenceType.createResolvedReference(
                    reflection.name,
                    reflection,
                    project,
                ),
            ]);
            hierarchy!.isTarget = true;

            if (reflection.extendedBy) {
                push(reflection.extendedBy);
            }

            // No point setting up a hierarchy if there is no hierarchy to display
            if (root!.next) {
                reflection.typeHierarchy = root;
            }
        });
    }
}
