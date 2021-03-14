import * as ts from "typescript";
import {
    DeclarationReflection,
    Reflection,
    ReflectionKind,
    SignatureReflection,
} from "../../models/reflections/index";
import { ReferenceType, Type } from "../../models/types/index";
import { zip } from "../../utils/array";
import { Component, ConverterComponent } from "../components";
import { Context } from "../context";
import { Converter } from "../converter";
import { copyComment } from "../utils/reflections";

/**
 * A plugin that detects interface implementations of functions and
 * properties on classes and links them.
 */
@Component({ name: "implements" })
export class ImplementsPlugin extends ConverterComponent {
    /**
     * Create a new ImplementsPlugin instance.
     */
    initialize() {
        this.listenTo(this.owner, Converter.EVENT_RESOLVE, this.onResolve, -10);
        this.listenTo(
            this.owner,
            Converter.EVENT_CREATE_DECLARATION,
            this.onDeclaration,
            -1000
        );
        this.listenTo(
            this.owner,
            Converter.EVENT_CREATE_SIGNATURE,
            this.onSignature,
            1000
        );
    }

    /**
     * Mark all members of the given class to be the implementation of the matching interface member.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param classReflection  The reflection of the classReflection class.
     * @param interfaceReflection  The reflection of the interfaceReflection interface.
     */
    private analyzeClass(
        context: Context,
        classReflection: DeclarationReflection,
        interfaceReflection: DeclarationReflection
    ) {
        if (!interfaceReflection.children) {
            return;
        }

        interfaceReflection.children.forEach(
            (interfaceMember: DeclarationReflection) => {
                if (!(interfaceMember instanceof DeclarationReflection)) {
                    return;
                }

                let classMember: DeclarationReflection | undefined;

                if (!classReflection.children) {
                    return;
                }

                for (
                    let index = 0, count = classReflection.children.length;
                    index < count;
                    index++
                ) {
                    const child = classReflection.children[index];
                    if (child.name !== interfaceMember.name) {
                        continue;
                    }
                    if (
                        child.flags.isStatic !== interfaceMember.flags.isStatic
                    ) {
                        continue;
                    }

                    classMember = child;
                    break;
                }

                if (!classMember) {
                    return;
                }

                const interfaceMemberName =
                    interfaceReflection.name + "." + interfaceMember.name;
                classMember.implementationOf = new ReferenceType(
                    interfaceMemberName,
                    interfaceMember,
                    context.project
                );
                copyComment(classMember, interfaceMember);

                if (
                    interfaceMember.kindOf(ReflectionKind.Property) &&
                    classMember.kindOf(ReflectionKind.Accessor)
                ) {
                    if (classMember.getSignature) {
                        copyComment(classMember.getSignature, interfaceMember);
                        classMember.getSignature.implementationOf =
                            classMember.implementationOf;
                    }
                    if (classMember.setSignature) {
                        copyComment(classMember.setSignature, interfaceMember);
                        classMember.setSignature.implementationOf =
                            classMember.implementationOf;
                    }
                }

                if (
                    interfaceMember.kindOf(ReflectionKind.FunctionOrMethod) &&
                    interfaceMember.signatures &&
                    classMember.signatures
                ) {
                    for (const [clsSig, intSig] of zip(
                        classMember.signatures,
                        interfaceMember.signatures
                    )) {
                        if (clsSig.implementationOf) {
                            clsSig.implementationOf = new ReferenceType(
                                clsSig.implementationOf.name,
                                intSig,
                                context.project
                            );
                        }
                        copyComment(clsSig, intSig);
                    }
                }
            }
        );
    }

    private analyzeInheritance(
        context: Context,
        reflection: DeclarationReflection
    ) {
        const extendedTypes = (reflection.extendedTypes?.filter((type) => {
            return (
                type instanceof ReferenceType &&
                type.reflection instanceof DeclarationReflection
            );
        }) ?? []) as Array<
            ReferenceType & { reflection: DeclarationReflection }
        >;

        for (const parent of extendedTypes) {
            for (const parentMember of parent.reflection.children ?? []) {
                const child = reflection.children?.find(
                    (child) =>
                        child.name == parentMember.name &&
                        child.flags.isStatic === parentMember.flags.isStatic
                );

                if (child) {
                    const key = child.overwrites
                        ? "overwrites"
                        : "inheritedFrom";

                    for (const [childSig, parentSig] of zip(
                        child.signatures ?? [],
                        parentMember.signatures ?? []
                    )) {
                        childSig[key] = new ReferenceType(
                            `${parent.name}.${parentMember.name}`,
                            parentSig,
                            context.project
                        );
                    }

                    child[key] = new ReferenceType(
                        `${parent.name}.${parentMember.name}`,
                        parentMember,
                        context.project
                    );
                    copyComment(child, parentMember);
                }
            }
        }
    }

    /**
     * Triggered when the converter resolves a reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently resolved.
     */
    private onResolve(context: Context, reflection: DeclarationReflection) {
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
                    type.reflection.kindOf(ReflectionKind.Interface)
                ) {
                    this.analyzeClass(
                        context,
                        reflection,
                        <DeclarationReflection>type.reflection
                    );
                }
            });
        }

        if (
            reflection.kindOf([
                ReflectionKind.Class,
                ReflectionKind.Interface,
            ]) &&
            reflection.extendedTypes
        ) {
            this.analyzeInheritance(context, reflection);
        }
    }

    private getExtensionInfo(
        context: Context,
        reflection: Reflection | undefined
    ) {
        if (!reflection || !reflection.kindOf(ReflectionKind.Inheritable)) {
            return;
        }

        // Need this because we re-use reflections for type literals.
        if (
            !reflection.parent ||
            !reflection.parent.kindOf(ReflectionKind.ClassOrInterface)
        ) {
            return;
        }

        const symbol = context.project.getSymbolFromReflection(
            reflection.parent
        );
        if (!symbol) {
            return;
        }

        const declaration = symbol
            .getDeclarations()
            ?.find(
                (n): n is ts.ClassDeclaration | ts.InterfaceDeclaration =>
                    ts.isClassDeclaration(n) || ts.isInterfaceDeclaration(n)
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
            const ctor = (info.declaration.members as ReadonlyArray<
                ts.ClassElement | ts.TypeElement
            >).find(ts.isConstructorDeclaration);
            constructorInheritance(context, reflection, info.declaration, ctor);
            return;
        }

        const childType = reflection.flags.isStatic
            ? context.checker.getTypeOfSymbolAtLocation(
                  info.symbol,
                  info.declaration
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
                }" for inheritance analysis. Please report a bug.`
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
                    reflection.flags.isStatic ? expr.expression : expr
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
                        isInherit
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
    constructorDecl: ts.ConstructorDeclaration | undefined
) {
    const extendsClause = childDecl.heritageClauses?.find(
        (cl) => cl.token === ts.SyntaxKind.ExtendsKeyword
    );

    if (!extendsClause) return;
    const name = `${extendsClause.types[0].getText()}.constructor`;

    const key = constructorDecl ? "overwrites" : "inheritedFrom";

    reflection[key] ??= ReferenceType.createBrokenReference(
        name,
        context.project
    );

    for (const sig of reflection.signatures ?? []) {
        sig[key] ??= ReferenceType.createBrokenReference(name, context.project);
    }
}

function findProperty(reflection: DeclarationReflection, parent: ts.Type) {
    return parent.getProperties().find((prop) => {
        return reflection.escapedName
            ? prop.escapedName === reflection.escapedName
            : prop.name === reflection.escapedName;
    });
}

function createLink(
    context: Context,
    reflection: DeclarationReflection,
    clause: ts.HeritageClause,
    expr: ts.ExpressionWithTypeArguments,
    symbol: ts.Symbol,
    isOverwrite: boolean
) {
    const project = context.project;
    const name = `${expr.expression.getText()}.${symbol.name}`;

    link(reflection);
    link(reflection.getSignature);
    link(reflection.setSignature);
    link(reflection.indexSignature);
    for (const sig of reflection.signatures ?? []) {
        link(sig);
    }

    // Intentionally create broken links here. These will be replaced with real links during
    // resolution if we can do so.
    function link(
        target: DeclarationReflection | SignatureReflection | undefined
    ) {
        if (!target) return;

        if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
            target.implementationOf ??= ReferenceType.createBrokenReference(
                name,
                project
            );
            return;
        }

        if (isOverwrite) {
            target.inheritedFrom ??= ReferenceType.createBrokenReference(
                name,
                project
            );
        } else {
            target.overwrites ??= ReferenceType.createBrokenReference(
                name,
                project
            );
        }
    }
}
