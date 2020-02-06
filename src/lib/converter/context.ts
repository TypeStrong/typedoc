import * as ts from 'typescript';
import { IMinimatch } from 'minimatch';

import { Logger } from '../utils/loggers';
import { createMinimatch } from '../utils/paths';
import { Reflection, ProjectReflection, ContainerReflection, Type } from '../models/index';

import { createTypeParameter } from './factories/type-parameter';
import { Converter } from './converter';

/**
 * The context describes the current state the converter is in.
 */
export class Context {
    /**
     * The converter instance that has created the context.
     */
    converter: Converter;

    /**
     * A list of all files that have been passed to the TypeScript compiler.
     */
    fileNames: string[];

    /**
     * The TypeChecker instance returned by the TypeScript compiler.
     */
    checker: ts.TypeChecker;

    /**
     * The program that is currently processed.
     */
    program: ts.Program;

    /**
     * The project that is currently processed.
     */
    project: ProjectReflection;

    /**
     * The scope or parent reflection that is currently processed.
     */
    scope: Reflection;

    /**
     * Is the current source file marked as being external?
     */
    isExternal?: boolean;

    /**
     * Is the current source file a declaration file?
     */
    isDeclaration?: boolean;

    /**
     * The currently set type parameters.
     */
    typeParameters?: ts.MapLike<Type>;

    /**
     * The currently set type arguments.
     */
    typeArguments?: Type[];

    /**
     * Is the converter in inheritance mode?
     */
    isInherit?: boolean;

    /**
     * The node that has started the inheritance mode.
     */
    inheritParent?: ts.Node;

    /**
     * List symbol fqns of inherited children already visited while inheriting.
     */
    inheritedChildren?: string[];

    /**
     * The names of the children of the scope before inheritance has been started.
     */
    inherited?: string[];

    /**
     * A list of parent nodes that have been passed to the visit function.
     */
    visitStack: ts.Node[];

    /**
     * The pattern that should be used to flag external source files.
     */
    private externalPattern?: Array<IMinimatch>;

    /**
     * Create a new Context instance.
     *
     * @param converter  The converter instance that has created the context.
     * @param fileNames  A list of all files that have been passed to the TypeScript compiler.
     * @param checker  The TypeChecker instance returned by the TypeScript compiler.
     */
    constructor(converter: Converter, fileNames: string[], checker: ts.TypeChecker, program: ts.Program) {
        this.converter = converter;
        this.fileNames = fileNames;
        this.checker = checker;
        this.program = program;
        this.visitStack = [];

        const project = new ProjectReflection(converter.name);
        this.project = project;
        this.scope = project;

        if (converter.externalPattern) {
            this.externalPattern = createMinimatch(converter.externalPattern);
        }
    }

    /**
     * Return the compiler options.
     */
    getCompilerOptions(): ts.CompilerOptions {
        return this.converter.application.options.getCompilerOptions();
    }

    /**
     * Return the type declaration of the given node.
     *
     * @param node  The TypeScript node whose type should be resolved.
     * @returns The type declaration of the given node.
     */
    getTypeAtLocation(node: ts.Node): ts.Type | undefined {
        let nodeType: ts.Type | undefined;
        try {
            nodeType = this.checker.getTypeAtLocation(node);
        } catch (error) {
        }
        if (!nodeType) {
            if (node.symbol) {
                nodeType = this.checker.getDeclaredTypeOfSymbol(node.symbol);
            } else if (node.parent && node.parent.symbol) {
                nodeType = this.checker.getDeclaredTypeOfSymbol(node.parent.symbol);
            } else if (node.parent && node.parent.parent && node.parent.parent.symbol) {
                nodeType = this.checker.getDeclaredTypeOfSymbol(node.parent.parent.symbol);
            }
        }
        return nodeType;
    }

    getSymbolAtLocation(node: ts.Node): ts.Symbol | undefined {
        let symbol = this.checker.getSymbolAtLocation(node);
        if (!symbol && isNamedNode(node)) {
            symbol = this.checker.getSymbolAtLocation(node.name);
        }
        return symbol;
    }

    resolveAliasedSymbol(symbol: ts.Symbol): ts.Symbol;
    resolveAliasedSymbol(symbol: ts.Symbol | undefined): ts.Symbol | undefined;
    resolveAliasedSymbol(symbol: ts.Symbol | undefined) {
        return (symbol && ts.SymbolFlags.Alias & symbol.flags) ? this.checker.getAliasedSymbol(symbol) : symbol;
    }

    /**
     * Return the current logger instance.
     *
     * @returns The current logger instance.
     */
    getLogger(): Logger {
        return this.converter.application.logger;
    }

    /**
     * Register a newly generated reflection. All created reflections should be
     * passed to this method to ensure that the project helper functions work correctly.
     *
     * @param reflection  The reflection that should be registered.
     * @param node  The node the given reflection was resolved from.
     * @param symbol  The symbol the given reflection was resolved from.
     */
    registerReflection(reflection: Reflection, symbol?: ts.Symbol) {
        if (symbol) {
            this.project.registerReflection(reflection, this.getFullyQualifiedName(symbol));
        } else {
            this.project.registerReflection(reflection);
        }
    }

    /**
     * Trigger a node reflection event.
     *
     * All events are dispatched on the current converter instance.
     *
     * @param name  The name of the event that should be triggered.
     * @param reflection  The triggering reflection.
     * @param node  The triggering TypeScript node if available.
     */
    trigger(name: string, reflection: Reflection, node?: ts.Node) {
        this.converter.trigger(name, this, reflection, node);
    }

    /**
     * Run the given callback with the context configured for the given source file.
     *
     * @param node  The TypeScript node containing the source file declaration.
     * @param callback  The callback that should be executed.
     */
    withSourceFile(node: ts.SourceFile, callback: Function) {
        const isExternal = this.isExternalFile(node.fileName);
        if (this.isOutsideDocumentation(node.fileName, isExternal)) {
            return;
        }

        const isDeclaration = node.isDeclarationFile;
        if (isDeclaration) {
            const lib = this.converter.getDefaultLib();
            const isLib = node.fileName.substr(-lib.length) === lib;
            if (!this.converter.includeDeclarations || isLib) {
                return;
            }
        }

        this.isExternal = isExternal;
        this.isDeclaration = isDeclaration;

        this.trigger(Converter.EVENT_FILE_BEGIN, this.project, node);
        callback();

        this.isExternal = false;
        this.isDeclaration = false;
    }

    /**
     * @param callback  The callback function that should be executed with the changed context.
     */
    public withScope(scope: Reflection | undefined, callback: () => void): void;

    /**
     * @param parameters  An array of type parameters that should be set on the context while the callback is invoked.
     * @param callback  The callback function that should be executed with the changed context.
     */
    public withScope(
        scope: Reflection | undefined,
        parameters: ts.NodeArray<ts.TypeParameterDeclaration> | undefined,
        callback: () => void): void;

    /**
     * @param parameters  An array of type parameters that should be set on the context while the callback is invoked.
     * @param preserve  Should the currently set type parameters of the context be preserved?
     * @param callback  The callback function that should be executed with the changed context.
     */
    public withScope(
        scope: Reflection | undefined,
        parameters: ts.NodeArray<ts.TypeParameterDeclaration> | undefined,
        preserve: boolean,
        callback: () => void): void;

    /**
     * Run the given callback with the scope of the context set to the given reflection.
     *
     * @param scope  The reflection that should be set as the scope of the context while the callback is invoked.
     */
    public withScope(scope: Reflection, ...args: any[]): void {
        if (!scope || !args.length) {
            return;
        }
        const callback = args.pop();
        const parameters = args.shift();

        const oldScope = this.scope;
        const oldTypeArguments = this.typeArguments;
        const oldTypeParameters = this.typeParameters;

        this.scope = scope;
        this.typeParameters = parameters ? this.extractTypeParameters(parameters, args.length > 0) : this.typeParameters;
        this.typeArguments = undefined;

        callback();

        this.scope = oldScope;
        this.typeParameters = oldTypeParameters;
        this.typeArguments = oldTypeArguments;
    }

    /**
     * Inherit the children of the given TypeScript node to the current scope.
     *
     * @param baseNode  The node whose children should be inherited.
     * @param typeArguments  The type arguments that apply while inheriting the given node.
     * @return The resulting reflection / the current scope.
     */
    inherit(baseNode: ts.Node, typeArguments?: ts.NodeArray<ts.TypeNode>): Reflection {
        const wasInherit = this.isInherit;
        const oldInherited = this.inherited;
        const oldInheritParent = this.inheritParent;
        const oldTypeArguments = this.typeArguments;

        this.isInherit = true;
        this.inheritParent = baseNode;
        this.inherited = [];

        const target = <ContainerReflection> this.scope;
        if (!(target instanceof ContainerReflection)) {
            throw new Error('Expected container reflection');
        }

        if (baseNode.symbol) {
            const id = this.getFullyQualifiedName(baseNode.symbol);
            if (this.inheritedChildren && this.inheritedChildren.includes(id)) {
                return target;
            } else {
                this.inheritedChildren = this.inheritedChildren || [];
                this.inheritedChildren.push(id);
            }
        }

        if (target.children) {
            this.inherited = target.children.map((c) => c.name);
        } else {
            this.inherited = [];
        }

        if (typeArguments) {
            this.typeArguments = this.converter.convertTypes(this, typeArguments);
        } else {
            this.typeArguments = undefined;
        }

        this.converter.convertNode(this, baseNode);

        this.isInherit = wasInherit;
        this.inherited = oldInherited;
        this.inheritParent = oldInheritParent;
        this.typeArguments = oldTypeArguments;

        if (!this.isInherit) {
            delete this.inheritedChildren;
        }

        return target;
    }

    /**
     * Determines if the given file is outside of the project's generated documentation.
     * This is not, and is not intended to be, foolproof. Plugins may remove reflections
     * in the file that this method returns true for, See GH#1166 for discussion on tradeoffs.
     *
     * @param fileName
     * @internal
     */
    isOutsideDocumentation(fileName: string, isExternal = this.isExternalFile(fileName)) {
        return isExternal && this.converter.excludeExternals;
    }

    /**
     * Checks if the given file is external.
     *
     * @param fileName
     * @internal
     */
    isExternalFile(fileName: string) {
        let isExternal = !this.fileNames.includes(fileName);
        if (!isExternal && this.externalPattern) {
            isExternal = this.externalPattern.some(mm => mm.match(fileName));
        }
        return isExternal;
    }

    /**
     * Convert the given list of type parameter declarations into a type mapping.
     *
     * @param parameters  The list of type parameter declarations that should be converted.
     * @param preserve  Should the currently set type parameters of the context be preserved?
     * @returns The resulting type mapping.
     */
    private extractTypeParameters(parameters: ts.NodeArray<ts.TypeParameterDeclaration>, preserve?: boolean): ts.MapLike<Type> {
        const typeParameters: ts.MapLike<Type> = {};

        if (preserve) {
            Object.keys(this.typeParameters || {}).forEach(key => {
                typeParameters[key] = this.typeParameters![key];
            });
        }

        parameters.forEach((declaration: ts.TypeParameterDeclaration, index: number) => {
            if (!declaration.symbol) {
                return;
            }
            const name = declaration.symbol.name;
            if (this.typeArguments && this.typeArguments[index]) {
                typeParameters[name] = this.typeArguments[index];
            } else {
                const param = createTypeParameter(this, declaration);
                if (param) {
                    typeParameters[name] = param;
                }
            }
        });

        return typeParameters;
    }

    /**
     * Typscript getFullyQualifiedName method don't always return unique string
     * in this case prefix it with sourcefile name
     *
     * @param symbol
     */
    getFullyQualifiedName(symbol: ts.Symbol): string {
        let fullyQualifiedName = this.checker.getFullyQualifiedName(symbol);
        if (!fullyQualifiedName.startsWith('"')) {
            if (symbol.declarations) {
                const node = symbol.declarations[0];
                if (node) {
                    const sourceFile = node.getSourceFile();
                    const filePath = sourceFile.fileName;
                    fullyQualifiedName = `"${filePath}".${fullyQualifiedName}`;
                }
            }
        }

        return fullyQualifiedName;
    }
}

function isNamedNode(node: ts.Node): node is ts.Node & { name: ts.Identifier | ts.ComputedPropertyName } {
    return node['name'] && (
        ts.isIdentifier(node['name']) ||
        ts.isComputedPropertyName(node['name'])
    );
}
