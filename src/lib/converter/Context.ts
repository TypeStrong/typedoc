module td.converter
{
    /**
     * The context describes the current state the converter is in.
     */
    export class Context
    {
        /**
         * The converter instance that has created the context.
         */
        converter:Converter;

        /**
         * A list of all files that have been passed to the TypeScript compiler.
         */
        fileNames:string[];

        /**
         * The TypeChecker instance returned by the TypeScript compiler.
         */
        checker:ts.TypeChecker;

        /**
         * The program that is currently processed.
         */
        program:ts.Program;

        /**
         * The project that is currently processed.
         */
        project:models.ProjectReflection;

        /**
         * The scope or parent reflection that is currently processed.
         */
        scope:models.Reflection;

        /**
         * Is the current source file marked as being external?
         */
        isExternal:boolean;

        /**
         * Is the current source file a declaration file?
         */
        isDeclaration:boolean;

        /**
         * The currently set type parameters.
         */
        typeParameters:ts.Map<models.Type>;

        /**
         * The currently set type arguments.
         */
        typeArguments:models.Type[];

        /**
         * Is the converter in inheritance mode?
         */
        isInherit:boolean;

        /**
         * The node that has started the inheritance mode.
         */
        inheritParent:ts.Node;

        /**
         * List symbol ids of inherited children already visited while inheriting.
         */
        inheritedChildren:number[];

        /**
         * The names of the children of the scope before inheritance has been started.
         */
        inherited:string[];

        /**
         * A list of parent nodes that have been passed to the visit function.
         */
        visitStack:ts.Node[];

        /**
         * Next free symbol id used by [[getSymbolID]].
         */
        private symbolID:number = -1024;

        /**
         * The pattern that should be used to flag external source files.
         */
        private externalPattern:{match(str:string):boolean;};



        /**
         * Create a new Context instance.
         *
         * @param converter  The converter instance that has created the context.
         * @param fileNames  A list of all files that have been passed to the TypeScript compiler.
         * @param checker  The TypeChecker instance returned by the TypeScript compiler.
         */
        constructor(converter:Converter, fileNames:string[], checker:ts.TypeChecker, program:ts.Program) {
            this.converter = converter;
            this.fileNames = fileNames;
            this.checker = checker;
            this.program = program;
            this.visitStack = [];

            var project = new models.ProjectReflection(this.getOptions().name);
            this.project = project;
            this.scope = project;

            var options = converter.application.options;
            if (options.externalPattern) {
                this.externalPattern = new Minimatch.Minimatch(options.externalPattern);
            }
        }


        /**
         * Return the current TypeDoc options object.
         */
        getOptions():IOptions {
            return this.converter.application.options;
        }


        /**
         * Return the compiler options.
         */
        getCompilerOptions():ts.CompilerOptions {
            return this.converter.application.compilerOptions;
        }


        /**
         * Return the type declaration of the given node.
         *
         * @param node  The TypeScript node whose type should be resolved.
         * @returns The type declaration of the given node.
         */
        getTypeAtLocation(node:ts.Node):ts.Type {
            try {
                return this.checker.getTypeAtLocation(node);
            } catch (error) {
                try {
                    if (node.symbol) {
                        return this.checker.getDeclaredTypeOfSymbol(node.symbol);
                    }
                } catch (error) {}
            }

            return null;
        }


        /**
         * Return the current logger instance.
         *
         * @returns The current logger instance.
         */
        getLogger():Logger {
            return this.converter.application.logger;
        }


        /**
         * Return the symbol id of the given symbol.
         *
         * The compiler sometimes does not assign an id to symbols, this method makes sure that we have one.
         * It will assign negative ids if they are not set.
         *
         * @param symbol  The symbol whose id should be returned.
         * @returns The id of the given symbol.
         */
        getSymbolID(symbol:ts.Symbol):number {
            if (!symbol) return null;
            if (!symbol.id) symbol.id = this.symbolID--;
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
        registerReflection(reflection:models.Reflection, node:ts.Node, symbol?:ts.Symbol) {
            this.project.reflections[reflection.id] = reflection;

            var id = this.getSymbolID(symbol ? symbol : (node ? node.symbol : null));
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
        trigger(name:string, reflection:models.Reflection, node?:ts.Node) {
            this.converter.dispatch(name, this, reflection, node);
        }


        /**
         * Run the given callback with the context configured for the given source file.
         *
         * @param node  The TypeScript node containing the source file declaration.
         * @param callback  The callback that should be executed.
         */
        withSourceFile(node:ts.SourceFile, callback:Function) {
            var options = this.converter.application.options;
            var externalPattern = this.externalPattern;
            var isExternal = this.fileNames.indexOf(node.fileName) == -1;
            if (externalPattern) {
                isExternal = isExternal || externalPattern.match(node.fileName);
            }

            if (isExternal && options.excludeExternals) {
                return;
            }

            var isDeclaration = ts.isDeclarationFile(node);
            if (isDeclaration) {
                var lib = this.converter.getDefaultLib();
                var isLib = node.fileName.substr(-lib.length) == lib;
                if (!options.includeDeclarations || isLib) {
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
        public withScope(scope:models.Reflection, callback:Function);

        /**
         * @param parameters  An array of type parameters that should be set on the context while the callback is invoked.
         * @param callback  The callback function that should be executed with the changed context.
         */
        public withScope(scope:models.Reflection, parameters:ts.NodeArray<ts.TypeParameterDeclaration>, callback:Function);

        /**
         * @param parameters  An array of type parameters that should be set on the context while the callback is invoked.
         * @param preserve  Should the currently set type parameters of the context be preserved?
         * @param callback  The callback function that should be executed with the changed context.
         */
        public withScope(scope:models.Reflection, parameters:ts.NodeArray<ts.TypeParameterDeclaration>, preserve:boolean, callback:Function);

        /**
         * Run the given callback with the scope of the context set to the given reflection.
         *
         * @param scope  The reflection that should be set as the scope of the context while the callback is invoked.
         */
        public withScope(scope:models.Reflection, ...args) {
            if (!scope || !args.length) return;
            var callback = args.pop();
            var parameters = args.shift();

            var oldScope = this.scope;
            var oldTypeArguments = this.typeArguments;
            var oldTypeParameters = this.typeParameters;

            this.scope = scope;
            this.typeParameters = parameters ? this.extractTypeParameters(parameters, args.length > 0) : this.typeParameters;
            this.typeArguments = null;

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
        inherit(baseNode:ts.Node, typeArguments?:ts.NodeArray<ts.TypeNode>):models.Reflection {
            var wasInherit = this.isInherit;
            var oldInherited = this.inherited;
            var oldInheritParent = this.inheritParent;
            var oldTypeArguments = this.typeArguments;

            this.isInherit = true;
            this.inheritParent = baseNode;
            this.inherited = [];

            var target = <models.ContainerReflection>this.scope;
            if (!(target instanceof models.ContainerReflection)) {
                throw new Error('Expected container reflection');
            }

            if (baseNode.symbol) {
                var id = this.getSymbolID(baseNode.symbol);
                if (this.inheritedChildren && this.inheritedChildren.indexOf(id) != -1) {
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
                this.typeArguments = typeArguments.map((t) => convertType(this, t));
            } else {
                this.typeArguments = null;
            }

            visit(this, baseNode);

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
        private extractTypeParameters(parameters:ts.NodeArray<ts.TypeParameterDeclaration>, preserve?:boolean):ts.Map<models.Type> {
            var typeParameters:ts.Map<models.Type> = {};

            if (preserve) {
                for (var key in this.typeParameters) {
                    if (!this.typeParameters.hasOwnProperty(key)) continue;
                    typeParameters[key] = this.typeParameters[key];
                }
            }

            parameters.forEach((declaration:ts.TypeParameterDeclaration, index:number) => {
                var name = declaration.symbol.name;
                if (this.typeArguments && this.typeArguments[index]) {
                    typeParameters[name] = this.typeArguments[index];
                } else {
                    typeParameters[name] = createTypeParameter(this, declaration);
                }
            });

            return typeParameters;
        }
    }
}