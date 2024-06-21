import ts from "typescript";
import { ApplicationEvents } from "../../application-events";
import {
    type ContainerReflection,
    DeclarationReflection,
    type ProjectReflection,
    type Reflection,
    ReflectionFlag,
    ReflectionKind,
    SignatureReflection,
} from "../../models/reflections/index";
import { ReferenceType, ReflectionType, type Type } from "../../models/types";
import { filterMap, zip } from "../../utils/array";
import { Component, ConverterComponent } from "../components";
import type { Context } from "../context";
import { Converter } from "../converter";
import { getHumanName } from "../../utils";
import type { TranslatedString } from "../../internationalization/internationalization";

/**
 * A plugin that detects interface implementations of functions and
 * properties on classes and links them.
 */
@Component({ name: "implements" })
export class ImplementsPlugin extends ConverterComponent {
    private resolved = new WeakSet<Reflection>();
    private postponed = new WeakMap<Reflection, Set<DeclarationReflection>>();

    /**
     * Create a new ImplementsPlugin instance.
     */
    override initialize() {
        this.owner.on(
            Converter.EVENT_RESOLVE_END,
            this.onResolveEnd.bind(this),
        );
        this.owner.on(
            Converter.EVENT_CREATE_DECLARATION,
            this.onDeclaration.bind(this),
            -1000,
        );
        this.owner.on(
            Converter.EVENT_CREATE_SIGNATURE,
            this.onSignature.bind(this),
            1000,
        );
        this.application.on(ApplicationEvents.REVIVE, this.resolve.bind(this));
    }

    /**
     * Mark all members of the given class to be the implementation of the matching interface member.
     */
    private analyzeImplements(
        project: ProjectReflection,
        classReflection: DeclarationReflection,
        interfaceReflection: DeclarationReflection,
    ) {
        handleInheritedComments(classReflection, interfaceReflection);
        if (!interfaceReflection.children) {
            return;
        }

        interfaceReflection.children.forEach((interfaceMember) => {
            const classMember = findMatchingMember(
                interfaceMember,
                classReflection,
            );

            if (!classMember) {
                return;
            }

            const interfaceMemberName =
                interfaceReflection.name + "." + interfaceMember.name;
            classMember.implementationOf =
                ReferenceType.createResolvedReference(
                    interfaceMemberName,
                    interfaceMember,
                    project,
                );

            const intSigs =
                interfaceMember.signatures ||
                interfaceMember.type?.visit({
                    reflection: (r) => r.declaration.signatures,
                });

            const clsSigs =
                classMember.signatures ||
                classMember.type?.visit({
                    reflection: (r) => r.declaration.signatures,
                });

            if (intSigs && clsSigs) {
                for (const [clsSig, intSig] of zip(clsSigs, intSigs)) {
                    if (clsSig.implementationOf) {
                        const target = intSig.parent.kindOf(
                            ReflectionKind.FunctionOrMethod,
                        )
                            ? intSig
                            : intSig.parent.parent!;
                        clsSig.implementationOf =
                            ReferenceType.createResolvedReference(
                                clsSig.implementationOf.name,
                                target,
                                project,
                            );
                    }
                }
            }

            handleInheritedComments(classMember, interfaceMember);
        });
    }

    private analyzeInheritance(
        project: ProjectReflection,
        reflection: DeclarationReflection,
    ) {
        const extendedTypes = filterMap(
            reflection.extendedTypes ?? [],
            (type) => {
                return type instanceof ReferenceType &&
                    type.reflection instanceof DeclarationReflection
                    ? (type as ReferenceType & {
                          reflection: DeclarationReflection;
                      })
                    : void 0;
            },
        );

        for (const parent of extendedTypes) {
            handleInheritedComments(reflection, parent.reflection);

            for (const parentMember of parent.reflection.children ?? []) {
                const child = findMatchingMember(parentMember, reflection);

                if (child) {
                    const key = child.overwrites
                        ? "overwrites"
                        : "inheritedFrom";

                    for (const [childSig, parentSig] of zip(
                        child.signatures ?? [],
                        parentMember.signatures ?? [],
                    )) {
                        childSig[key] = ReferenceType.createResolvedReference(
                            `${parent.name}.${parentMember.name}`,
                            parentSig,
                            project,
                        );
                    }

                    child[key] = ReferenceType.createResolvedReference(
                        `${parent.name}.${parentMember.name}`,
                        parentMember,
                        project,
                    );

                    handleInheritedComments(child, parentMember);
                }
            }
        }
    }

    private onResolveEnd(context: Context) {
        this.resolve(context.project);
    }

    private resolve(project: ProjectReflection) {
        for (const id in project.reflections) {
            const refl = project.reflections[id];
            if (refl instanceof DeclarationReflection) {
                this.tryResolve(project, refl);
            }
        }
    }

    private tryResolve(
        project: ProjectReflection,
        reflection: DeclarationReflection,
    ) {
        const requirements = filterMap(
            [
                ...(reflection.implementedTypes ?? []),
                ...(reflection.extendedTypes ?? []),
            ],
            (type) => {
                return type instanceof ReferenceType ? type.reflection : void 0;
            },
        );

        if (requirements.every((req) => this.resolved.has(req))) {
            this.doResolve(project, reflection);
            this.resolved.add(reflection);

            for (const refl of this.postponed.get(reflection) ?? []) {
                this.tryResolve(project, refl);
            }
            this.postponed.delete(reflection);
        } else {
            for (const req of requirements) {
                const future = this.postponed.get(req) ?? new Set();
                future.add(reflection);
                this.postponed.set(req, future);
            }
        }
    }

    private doResolve(
        project: ProjectReflection,
        reflection: DeclarationReflection,
    ) {
        if (
            reflection.kindOf(ReflectionKind.Class) &&
            reflection.implementedTypes
        ) {
            reflection.implementedTypes.forEach((type: Type) => {
                if (!(type instanceof ReferenceType)) {
                    return;
                }

                if (
                    type.reflection &&
                    type.reflection.kindOf(ReflectionKind.ClassOrInterface)
                ) {
                    this.analyzeImplements(
                        project,
                        reflection,
                        type.reflection as DeclarationReflection,
                    );
                }
            });
        }

        if (
            reflection.kindOf(ReflectionKind.ClassOrInterface) &&
            reflection.extendedTypes
        ) {
            this.analyzeInheritance(project, reflection);
        }
    }

    private getExtensionInfo(
        context: Context,
        reflection: Reflection | undefined,
    ) {
        if (!reflection || !reflection.kindOf(ReflectionKind.Inheritable)) {
            return;
        }

        // Need this because we re-use reflections for type literals.
        if (!reflection.parent?.kindOf(ReflectionKind.ClassOrInterface)) {
            return;
        }

        const symbol = context.project.getSymbolFromReflection(
            reflection.parent,
        );
        if (!symbol) {
            return;
        }

        const declaration = symbol
            .getDeclarations()
            ?.find(
                (n): n is ts.ClassDeclaration | ts.InterfaceDeclaration =>
                    ts.isClassDeclaration(n) || ts.isInterfaceDeclaration(n),
            );
        if (!declaration) {
            return;
        }

        return { symbol, declaration };
    }

    private onSignature(context: Context, reflection: SignatureReflection) {
        this.onDeclaration(context, reflection.parent);
    }

    /**
     * Responsible for setting the {@link DeclarationReflection.inheritedFrom},
     * {@link DeclarationReflection.overwrites}, and {@link DeclarationReflection.implementationOf}
     * properties on the provided reflection temporarily, these links will be replaced
     * during the resolve step with links which actually point to the right place.
     */
    private onDeclaration(context: Context, reflection: DeclarationReflection) {
        const info = this.getExtensionInfo(context, reflection);
        if (!info) {
            return;
        }

        if (reflection.kind === ReflectionKind.Constructor) {
            const ctor = (
                info.declaration.members as ReadonlyArray<
                    ts.ClassElement | ts.TypeElement
                >
            ).find(ts.isConstructorDeclaration);
            constructorInheritance(context, reflection, info.declaration, ctor);
            return;
        }

        const childType = reflection.flags.isStatic
            ? context.checker.getTypeOfSymbolAtLocation(
                  info.symbol,
                  info.declaration,
              )
            : context.checker.getDeclaredTypeOfSymbol(info.symbol);

        const property = findProperty(reflection, childType);

        if (!property) {
            // We're probably broken... but I don't think this should be fatal.
            context.logger.warn(
                `Failed to retrieve${
                    reflection.flags.isStatic ? " static" : ""
                } member "${reflection.escapedName ?? reflection.name}" of "${
                    reflection.parent?.name
                }" for inheritance analysis. Please report a bug.` as TranslatedString,
            );
            return;
        }

        // Need to check both extends and implements clauses.
        out: for (const clause of info.declaration.heritageClauses ?? []) {
            // No point checking implemented types for static members, they won't exist.
            if (
                reflection.flags.isStatic &&
                clause.token === ts.SyntaxKind.ImplementsKeyword
            ) {
                continue;
            }

            for (const expr of clause.types) {
                const parentType = context.checker.getTypeAtLocation(
                    reflection.flags.isStatic ? expr.expression : expr,
                );

                const parentProperty = findProperty(reflection, parentType);
                if (parentProperty) {
                    const isInherit =
                        property
                            .getDeclarations()
                            ?.some((d) => d.parent !== info.declaration) ??
                        true;

                    createLink(
                        context,
                        reflection,
                        clause,
                        expr,
                        parentProperty,
                        isInherit,
                    );

                    // Can't always break because we need to also set `implementationOf` if we
                    // inherit from a base class and also implement an interface.
                    if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
                        break out;
                    }
                }
            }
        }
    }
}

function constructorInheritance(
    context: Context,
    reflection: DeclarationReflection,
    childDecl: ts.ClassDeclaration | ts.InterfaceDeclaration,
    constructorDecl: ts.ConstructorDeclaration | undefined,
) {
    const extendsClause = childDecl.heritageClauses?.find(
        (cl) => cl.token === ts.SyntaxKind.ExtendsKeyword,
    );

    if (!extendsClause) return;
    const name = `${extendsClause.types[0].getText()}.constructor`;

    const key = constructorDecl ? "overwrites" : "inheritedFrom";

    reflection[key] ??= ReferenceType.createBrokenReference(
        name,
        context.project,
    );

    for (const sig of reflection.signatures ?? []) {
        sig[key] ??= ReferenceType.createBrokenReference(name, context.project);
    }
}

function findProperty(reflection: DeclarationReflection, parent: ts.Type) {
    return parent.getProperties().find((prop) => {
        return reflection.escapedName
            ? prop.escapedName === reflection.escapedName
            : prop.name === reflection.name;
    });
}

function createLink(
    context: Context,
    reflection: DeclarationReflection,
    clause: ts.HeritageClause,
    expr: ts.ExpressionWithTypeArguments,
    symbol: ts.Symbol,
    isInherit: boolean,
) {
    const project = context.project;
    const name = `${expr.expression.getText()}.${getHumanName(symbol.name)}`;

    link(reflection);
    link(reflection.getSignature);
    link(reflection.setSignature);
    for (const sig of reflection.indexSignatures || []) {
        link(sig);
    }
    for (const sig of reflection.signatures ?? []) {
        link(sig);
    }

    // Intentionally create broken links here. These will be replaced with real links during
    // resolution if we can do so.
    function link(
        target: DeclarationReflection | SignatureReflection | undefined,
    ) {
        if (!target) return;

        if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
            target.implementationOf ??= ReferenceType.createBrokenReference(
                name,
                project,
            );
            return;
        }

        if (isInherit) {
            target.setFlag(ReflectionFlag.Inherited);
            target.inheritedFrom ??= ReferenceType.createBrokenReference(
                name,
                project,
            );
        } else {
            target.overwrites ??= ReferenceType.createBrokenReference(
                name,
                project,
            );
        }
    }
}

/**
 * Responsible for copying comments from "parent" reflections defined
 * in either a base class or implemented interface to the child class.
 */
function handleInheritedComments(
    child: DeclarationReflection,
    parent: DeclarationReflection,
) {
    copyComment(child, parent);

    if (
        parent.kindOf(ReflectionKind.Property) &&
        child.kindOf(ReflectionKind.Accessor)
    ) {
        if (child.getSignature) {
            copyComment(child.getSignature, parent);
            child.getSignature.implementationOf = child.implementationOf;
        }
        if (child.setSignature) {
            copyComment(child.setSignature, parent);
            child.setSignature.implementationOf = child.implementationOf;
        }
    }
    if (
        parent.kindOf(ReflectionKind.Accessor) &&
        child.kindOf(ReflectionKind.Accessor)
    ) {
        if (parent.getSignature && child.getSignature) {
            copyComment(child.getSignature, parent.getSignature);
        }
        if (parent.setSignature && child.setSignature) {
            copyComment(child.setSignature, parent.setSignature);
        }
    }

    if (
        parent.kindOf(ReflectionKind.FunctionOrMethod) &&
        parent.signatures &&
        child.signatures
    ) {
        for (const [cs, ps] of zip(child.signatures, parent.signatures)) {
            copyComment(cs, ps);
        }
    } else if (
        parent.kindOf(ReflectionKind.Property) &&
        parent.type instanceof ReflectionType &&
        parent.type.declaration.signatures &&
        child.signatures
    ) {
        for (const [cs, ps] of zip(
            child.signatures,
            parent.type.declaration.signatures,
        )) {
            copyComment(cs, ps);
        }
    }
}

/**
 * Copy the comment of the source reflection to the target reflection with a JSDoc style copy
 * function. The TSDoc copy function is in the InheritDocPlugin.
 */
function copyComment(target: Reflection, source: Reflection) {
    if (target.comment) {
        // We might still want to copy, if the child has a JSDoc style inheritDoc tag.
        const tag = target.comment.getTag("@inheritDoc");
        if (!tag || tag.name) {
            return;
        }
    }

    if (!source.comment) {
        return;
    }

    target.comment = source.comment.clone();

    if (
        target instanceof DeclarationReflection &&
        source instanceof DeclarationReflection
    ) {
        for (const [tt, ts] of zip(
            target.typeParameters || [],
            source.typeParameters || [],
        )) {
            copyComment(tt, ts);
        }
    }
    if (
        target instanceof SignatureReflection &&
        source instanceof SignatureReflection
    ) {
        for (const [tt, ts] of zip(
            target.typeParameters || [],
            source.typeParameters || [],
        )) {
            copyComment(tt, ts);
        }
        for (const [pt, ps] of zip(
            target.parameters || [],
            source.parameters || [],
        )) {
            copyComment(pt, ps);
        }
    }
}

function findMatchingMember(
    toMatch: Reflection,
    container: ContainerReflection,
) {
    return container.children?.find(
        (child) =>
            child.name == toMatch.name &&
            child.flags.isStatic === toMatch.flags.isStatic,
    );
}
