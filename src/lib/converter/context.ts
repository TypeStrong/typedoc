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
     * List symbol ids of inherited children already visited while inheriting.
     */
    inheritedChildren?: number[];

    /**
     * The names of the children of the scope before inheritance has been started.
     */
    inherited?: string[];

    /**
     * A list of parent nodes that have been passed to the visit function.
     */
    visitStack: ts.Node[];

    /**
     * Next free symbol id used by [[getSymbolID]].
     */
    private symbolID = -1024;

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

    /**
     * Return the current logger instance.
     *
     * @returns The current logger instance.
     */
    getLogger(): Logger {
        return this.converter.application.logger;
    }

    /**
     * Return the symbol id of the given symbol.
     *
     * The compiler sometimes does not assign an id to symbols, this method makes sure that we have one.
     * It will assign negative ids if they are not set.
     *
     * @param symbol  The symbol whose id should be returned.
     * @returns The id of the given symbol or undefined if no symbol is provided.
     */
    getSymbolID(symbol: ts.Symbol | undefined): number | undefined {
        if (!symbol) {
            return;
        }
        if (!symbol.id) {
            symbol.id = this.symbolID--;
        }
        return symbol.id;
    }

    /**
     * Register a newly generated reflection.
     *
     * Ensures that the reflection is both listed in [[Project.reflections]] and
     * [[Project.symbolMapping]] if applicable.
     *
     * @param reflection  The reflection that should be registered.
     * @param node  The node the given reflection was resolved from.
     * @param symbol  The symbol the given reflection was resolved from.
     */
    registerReflection(reflection: Reflection, node?: ts.Node, symbol?: ts.Symbol) {
        this.project.reflections[reflection.id] = reflection;

        const id = this.getSymbolID(symbol ? symbol : (node ? node.symbol : undefined));
        if (!this.isInherit && id && !this.project.symbolMapping[id]) {
            this.project.symbolMapping[id] = reflection.id;
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
        let isExternal = !this.fileNames.includes(node.fileName);
        if (!isExternal && this.externalPattern) {
            isExternal = this.externalPattern.some(mm => mm.match(node.fileName));
        }

        if (isExternal && this.converter.excludeExternals) {
            return;
        }

        let isDeclaration = node.isDeclarationFile;
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
            const id = this.getSymbolID(baseNode.symbol)!;
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
}
