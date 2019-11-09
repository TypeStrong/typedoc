import * as ts from 'typescript';

import { ContainerReflection, DeclarationReflection, ExportDeclarationReflection, Reflection, ReflectionKind, ReflectionFlag,
         markAsExported } from '../../models/index';
import { Context } from '../context';
import { Converter } from '../converter';
import { createReferenceType } from './reference';

/**
 * List of reflection kinds that never should be static.
 */
const nonStaticKinds = [
    ReflectionKind.Class,
    ReflectionKind.Interface,
    ReflectionKind.Module
];

/**
 * List of ts kinds leading to none static merge.
 */
const nonStaticMergeKinds = [
    ts.SyntaxKind.ClassDeclaration,
    ts.SyntaxKind.ClassExpression,
    ts.SyntaxKind.InterfaceDeclaration
];

/**
 * Create a declaration reflection from the given TypeScript node.
 *
 * @param context  The context object describing the current state the converter is in. The
 *   scope of the context will be the parent of the generated reflection.
 * @param node  The TypeScript node that should be converted to a reflection.
 * @param kind  The desired kind of the reflection.
 * @param name  The desired name of the reflection.
 * @returns The resulting reflection or undefined if an error is encountered.
 */
export function createDeclaration(context: Context, node: ts.Declaration, kind: ReflectionKind, name?: string): DeclarationReflection | undefined {
    const scope = context.scope;
    // Ensure we have a name for the reflection
    if (!name) {
        if (node.localSymbol) {
            name = node.localSymbol.name;
        } else if (node.symbol) {
            name = node.symbol.name;
        } else {
            return;
        }
    }

    const modifiers = ts.getCombinedModifierFlags(node);

    // Test whether the node is exported
    let isExported: boolean;
    if (scope.kindOf([ReflectionKind.Module, ReflectionKind.ExternalModule])) {
        isExported = false; // Don't inherit exported state in modules and namespaces
    } else {
        isExported = scope.flags.isExported;
    }

    let hasExport = false;
    if (kind === ReflectionKind.ExternalModule) {
        isExported = true; // Always mark external modules as exported
    } else if (node.parent && node.parent.kind === ts.SyntaxKind.VariableDeclarationList) {
        const parentNodeExported = !!(ts.getCombinedModifierFlags(node.parent.parent as ts.Declaration) && ts.ModifierFlags.Export);
        isExported = isExported || parentNodeExported;
        hasExport = parentNodeExported;
    } else {
        const nodeExported = !!(modifiers & ts.ModifierFlags.Export);
        isExported = isExported || nodeExported;
        hasExport = nodeExported;
    }

    // Test whether the node is private, when inheriting ignore private members
    const isPrivate = !!(modifiers & ts.ModifierFlags.Private);
    if (context.isInherit && isPrivate) {
        return;
    }

    // Test whether the node is static, when merging a module to a class make the node static
    let isConstructorProperty = false;
    let isStatic = false;
    if (!nonStaticKinds.includes(kind)) {
        isStatic = !!(modifiers & ts.ModifierFlags.Static);
        if (scope.kind === ReflectionKind.Class) {
            if (node.parent && node.parent.kind === ts.SyntaxKind.Constructor) {
                isConstructorProperty = true;
            } else if (!node.parent || !nonStaticMergeKinds.includes(node.parent.kind)) {
                isStatic = true;
            }
        }
    }

    // Check if we already have a child with the same name and static flag
    let child: DeclarationReflection | undefined;
    let children: DeclarationReflection[] | undefined;
    if (scope instanceof ContainerReflection) {
        children = scope.children = scope.children || [];
        children.forEach((n: DeclarationReflection) => {
            if (n.name === name && n.flags.isStatic === isStatic && canMergeReflectionsByKind(n.kind, kind)) {
                child = n;
            }
        });
    }

    if (!child) {
        // Child does not exist, create a new reflection
        child = new DeclarationReflection(name, kind, scope);
        child.setFlag(ReflectionFlag.Static, isStatic);
        child.setFlag(ReflectionFlag.Private, isPrivate);
        child.setFlag(ReflectionFlag.ConstructorProperty, isConstructorProperty);
        child.setFlag(ReflectionFlag.Exported, isExported);
        child.setFlag(ReflectionFlag.Export, hasExport);
        child = setupDeclaration(context, child, node);

        if (children) {
            children.push(child);
        }
        context.registerReflection(child, node);
    } else {
        // Merge the existent reflection with the given node
        child = mergeDeclarations(context, child, node, kind);
    }

    // If we have a reflection, trigger the corresponding event
    if (child) {
        context.trigger(Converter.EVENT_CREATE_DECLARATION, child, node);
    }

    return child;
}

/**
 * Setup a newly created declaration reflection.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param reflection  The newly created blank reflection.
 * @param node  The TypeScript node whose properties should be applies to the given reflection.
 * @returns The reflection populated with the values of the given node.
 */
function setupDeclaration(context: Context, reflection: DeclarationReflection, node: ts.Declaration): DeclarationReflection {
    const modifiers = ts.getCombinedModifierFlags(node);

    reflection.setFlag(ReflectionFlag.External,  context.isExternal);
    reflection.setFlag(ReflectionFlag.Protected, !!(modifiers & ts.ModifierFlags.Protected));
    reflection.setFlag(ReflectionFlag.Public,    !!(modifiers & ts.ModifierFlags.Public));
    reflection.setFlag(ReflectionFlag.Optional,  !!(node['questionToken']));

    if (
        context.isInherit &&
        (node.parent === context.inheritParent || reflection.flags.isConstructorProperty)
    ) {
        if (!reflection.inheritedFrom) {
            reflection.inheritedFrom = createReferenceType(context, node.symbol, true);
            reflection.getAllSignatures().forEach((signature) => {
                signature.inheritedFrom = createReferenceType(context, node.symbol, true);
            });
        }
    }

    return reflection;
}

// we should not be merging type and value with the same name,
// because TypeScript has different namespaces for these two categories
function canMergeReflectionsByKind(kind1: ReflectionKind, kind2: ReflectionKind): boolean {
    if (
        (kind1 & ReflectionKind.SomeType && kind2 & ReflectionKind.SomeValue)
        ||
        (kind2 & ReflectionKind.SomeType && kind1 & ReflectionKind.SomeValue)
    ) {
        return false;
    }

    return true;
}

/**
 * Merge the properties of the given TypeScript node with the pre existent reflection.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param reflection  The pre existent reflection.
 * @param node  The TypeScript node whose properties should be merged with the given reflection.
 * @param kind  The desired kind of the reflection.
 * @returns The reflection merged with the values of the given node or NULL if the merge is invalid.
 */
function mergeDeclarations(context: Context, reflection: DeclarationReflection, node: ts.Node, kind: ReflectionKind) {
    if (reflection.kind !== kind) {
        const weights = [ReflectionKind.Module, ReflectionKind.Enum, ReflectionKind.Class];
        const kindWeight = weights.indexOf(kind);
        const childKindWeight = weights.indexOf(reflection.kind);
        if (kindWeight > childKindWeight) {
            reflection.kind = kind;
        }
    }

    if (
        context.isInherit &&
        (context.inherited || []).includes(reflection.name) &&
        (node.parent === context.inheritParent || reflection.flags.isConstructorProperty)
    ) {
        if (!reflection.overwrites) {
            reflection.overwrites = createReferenceType(context, node.symbol, true);
            reflection.getAllSignatures().forEach((signature) => {
                signature.overwrites = createReferenceType(context, node.symbol, true);
            });
        }
        return;
    }

    return reflection;
}

/**
 * Create a `DeclarationReflection` for a symbol that renames another symbol.
 *
 * @param contex The context for the new declaration.
 *
 * @param node The node for the new declaration.
 *
 * @param original The declartion for the symbol being rename.
 *
 * @param name The new name.
 */
function createRename(context: Context, node: ts.Declaration, original: Reflection, name: string): DeclarationReflection {
    const { kind, id } = original;
    const rename = createDeclaration(context, node, kind, name)!;
    rename.renames = id;
    rename.setFlag(ReflectionFlag.Export, true);
    markAsExported(rename);

    return rename;
}

/**
 * @param node The node whose position we want.
 *
 * @returns A human-readable representation of the node's position.
 */
function nicePosition(node: ts.Node): string {
    return `${node.getSourceFile().fileName}:${node.pos}`;
}

class ExportDeclarationConverter {
    /**
     * This keeps track of modules we've already converted. Because of dependencies among modules, we may
     * *try* to convert the same module more than once.
     */
    private readonly converted: Set<ContainerReflection> = new Set();

    /**
     * The `ExportDeclarationConverter` class implements the conversion of `ExportDeclarationReflection` objects to
     * plain old `DeclarationReflection` objects. The conversion needs to traverse reflections in a particular way,
     * which this class encapsulates.
     *
     * @param context The current conversion context.
     */
    constructor(private readonly context: Context) {}

    /**
     * Convert an `ExportDeclarationReflection` to one or more `DeclarationReflection`.
     *
     * @param reflection The reflection to convert.
     */
    convertExportDeclarationReflection(reflection: ExportDeclarationReflection): void {
        const { context } = this;
        const node = reflection.exportDeclaration;
        const { exportClause, moduleSpecifier } = node;
        context.withScope(reflection.parent, () => {
            if (moduleSpecifier) {
                // Export declarations with "from ...".
                //
                // Example case:
                // export ... from "some/module";

                // We first need to convert the declarations for the module we depend on. This is necessary in cases where we have module A
                // that exports a symbol which is reexported from B, and the symbol from B is reexported from C. The ExportDeclarationReflection
                // in B must be processed before the one in C.
                this.findAndConvertModule(moduleSpecifier);

                if (exportClause) {
                    // export { ... } from "some/module";
                    for (const exportSpecifier of exportClause.elements) {
                        const symbol = context.checker.getAliasedSymbol(exportSpecifier.symbol!);
                        for (const declaration of symbol.declarations) {
                            const reflection = context.getReflectionForSymbol(declaration.symbol!);
                            if (!reflection) {
                                throw new Error(`cannot get reflection for symbol ${declaration.symbol!.name} at ${nicePosition(declaration)}`);
                            }

                            // We always create a rename.
                            createRename(context, exportSpecifier, reflection, exportSpecifier.name.text);
                        }
                    }
                } else {
                    // export * from "some/module";
                    const symbol = context.checker.getSymbolAtLocation(moduleSpecifier)!;
                    for (const xp of context.checker.getExportsOfModule(symbol)) {
                        for (const declaration of xp.declarations) {
                            let symbol = declaration.symbol!;
                            let { name } = symbol;

                            // If the symbol exported from "some/module" is a rename, then it is an alias and we need to follow the alias to the original symbol.
                            if ((symbol.flags & ts.SymbolFlags.Alias) === ts.SymbolFlags.Alias) {
                                symbol = context.checker.getAliasedSymbol(symbol);
                            }

                            const reflection = context.getReflectionForSymbol(symbol);
                            if (!reflection) {
                                throw new Error(`cannot get reflection for symbol ${declaration.symbol!.name} at ${nicePosition(declaration)}`);
                            }

                            // We always create a rename.
                            createRename(context, node, reflection, name);
                        }
                    }
                }
            } else {
                // Export declarations without "from ..."
                for (const exportSpecifier of exportClause!.elements) {
                    const symbol = context.getTypeAtLocation(exportSpecifier)!.symbol;
                    for (const declaration of symbol.declarations) {
                        const reflection = context.getReflectionForSymbol(declaration.symbol!);
                        if (!reflection) {
                            throw new Error(`cannot get reflection for symbol ${declaration.symbol!.name} at ${nicePosition(declaration)}`);
                        }

                        if (exportSpecifier.propertyName) {
                            // If propertyName is present then the symbol is being renamed as it is exported.
                            // Example case:
                            //
                            // function foo {}
                            // export { foo as bar }
                            //
                            // We need to create a new declaration referring back to the original declaration.
                            //
                            createRename(context, exportSpecifier, reflection, exportSpecifier.name.text);
                        } else {
                            //
                            // Export without rename.
                            //
                            // Example case:
                            // function foo {}
                            // export { foo }
                            reflection.setFlag(ReflectionFlag.Export, true);
                            markAsExported(reflection);
                        }
                    }
                }
            }
        });
    }

    /**
     * Convert the `ExportDeclarationReflection` of a specific module, if we have not done it already.
     *
     * @param reflection The reflection for the module to convert.
     */
    private convertModule(reflection: ContainerReflection): void {
        // Don't waste time scanning the children of a module we've already converted.
        if (this.converted.has(reflection)) {
            return;
        }

        const children = reflection.children || [];
        for (let ix = 0; ix < children.length; ++ix) {
            const child = children[ix];
            if (child instanceof ExportDeclarationReflection) {
                // The converted children are automatically added to child.parent.
                this.convertExportDeclarationReflection(child);
                children.splice(ix, 1);
                // We need to adjust the index to take into account the splicing.
                ix--;
            }
        }

        this.converted.add(reflection);
    }

    /**
     * @param moduleSpecifier The string expression in the `from` clause an export declaration.
     */
    private findAndConvertModule(moduleSpecifier: ts.Expression): void {
        const symbol = this.context.checker.getSymbolAtLocation(moduleSpecifier)!;
        const reflection = this.context.getReflectionForSymbol(symbol);

        if (!reflection) {
            throw new Error(`could not find module with name ${symbol.name}`);
        }

        // This reflection is necessarily a ContainerReflection.
        this.convertModule(reflection as ContainerReflection);
    }

    /**
     * Convert a whole project. This is the starting point of conversion.
     */
    convertProject(): void {
        // We need to convert the ExportDeclaration declarations to their final form. To do this, we extract all reflections which *can*
        // have export declarations among their children. These happen to be Module and ExternalModule reflections. We then scan their
        // children for ExportDeclarationReflection and convert them.
        const exportingReflections = this.context.project.getReflectionsByKind([ReflectionKind.Module, ReflectionKind.ExternalModule]) as ContainerReflection[];
        for (const reflection of exportingReflections) {
            this.convertModule(reflection);
        }
    }
}

/**
 * Convert all `ExportDeclarationReflection` of a project to one or more `DeclarationReflection`. This function
 * must be called after the tree of reflections for the whole project has been generated.
 *
 * @param contex The conversion context.
 */
export function convertExportDeclarationReflections(context: Context): void {
    new ExportDeclarationConverter(context).convertProject();
}
