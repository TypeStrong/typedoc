module td
{
    /**
     * The context describes the current state the converter is in.
     */
    export class Context
    {
        public settings:IOptions;

        public compilerOptions:ts.CompilerOptions;

        private checker:ts.TypeChecker;

        /**
         * The project that is currently processed.
         */
        private project:ProjectReflection;

        /**
         * The scope or parent reflection that is currently processed.
         */
        private scope:Reflection;

        public typeParameters:{[name:string]:Type};

        private typeArguments:Type[];

        public isInherit:boolean;

        public inheritParent:ts.Node;

        public inherited:string[];

        private symbolID:number = -1024;

        isExternal:boolean;

        isDeclaration:boolean;

        fileNames:string[];

        externalPattern:{match(str:string):boolean;};

        private event:CompilerEvent;

        private converter:Converter;



        /**
         * Create a new context.
         *
         * @param settings
         * @param checker
         * @param project  The target project.
         */
        constructor(converter:Converter, settings:IOptions, compilerOptions:ts.CompilerOptions, fileNames:string[], checker:ts.TypeChecker, project:ProjectReflection) {
            this.converter = converter;
            this.settings = settings;
            this.compilerOptions = compilerOptions;
            this.fileNames = fileNames;
            this.checker = checker;
            this.project = project;
            this.scope = project;

            this.externalPattern = settings.externalPattern ? new Minimatch.Minimatch(settings.externalPattern) : null;
            this.event = new CompilerEvent(checker, project, settings);
        }


        /**
         * Return the current parent reflection.
         */
        public getScope():Reflection {
            return this.scope;
        }

        getProject():ProjectReflection {
            return this.project;
        }

        getTypeChecker():ts.TypeChecker {
            return this.checker;
        }


        getTypeAtLocation(node:ts.Node):ts.Type {
            return this.checker.getTypeAtLocation(node);
        }


        getSymbolID(symbol:ts.Symbol):number {
            if (!symbol) return null;
            if (!symbol.id) symbol.id = this.symbolID--;
            return symbol.id;
        }


        registerReflection(reflection:Reflection, node:ts.Node, symbol?:ts.Symbol) {
            this.project.reflections[reflection.id] = reflection;

            var id = this.getSymbolID(symbol ? symbol : node.symbol);
            if (!this.isInherit && id && !this.project.symbolMapping[id]) {
                this.project.symbolMapping[id] = reflection.id;
            }
        }


        trigger(name:string, reflection:Reflection, node:ts.Node) {
            this.event.reflection = reflection;
            this.event.node = node;
            this.converter.dispatch(name, this.event);
        }


        /**
         * Set the context to the given reflection.
         *
         * @param scope
         * @param callback
         */
        public withScope(scope:Reflection, callback:Function);
        public withScope(scope:Reflection, parameters:ts.NodeArray<ts.TypeParameterDeclaration>, callback:Function);
        public withScope(scope:Reflection, parameters:ts.NodeArray<ts.TypeParameterDeclaration>, preserveTypeParameters:boolean, callback:Function);
        public withScope(scope:Reflection, ...args) {
            if (!scope || !args.length) return;
            var callback = args.pop();
            var oldScope = this.scope;
            var oldTypeArguments = this.typeArguments;
            this.scope = scope;
            this.typeArguments = null;

            var parameters:ts.NodeArray<ts.TypeParameterDeclaration> = args.shift();
            if (parameters) {
                var oldTypeParameters = this.typeParameters;
                var typeParameters:{[name:string]:Type} = {};

                if (args.length) {
                    for (var key in oldTypeParameters) {
                        if (!oldTypeParameters.hasOwnProperty(key)) continue;
                        typeParameters[key] = oldTypeParameters[key];
                    }
                }

                parameters.forEach((declaration:ts.TypeParameterDeclaration, index:number) => {
                    var name = declaration.symbol.name;
                    if (oldTypeArguments && oldTypeArguments[index]) {
                        typeParameters[name] = oldTypeArguments[index];
                    } else {
                        typeParameters[name] = createTypeParameter(this, declaration);
                    }
                });

                this.typeParameters = typeParameters;
                callback();
                this.typeParameters = oldTypeParameters;
            } else {
                callback();
            }

            this.scope = oldScope;
            this.typeArguments = oldTypeArguments;
        }


        withSourceFile(node:ts.SourceFile, callback:Function) {
            this.isExternal = this.fileNames.indexOf(node.filename) == -1;
            if (this.externalPattern) {
                this.isExternal = this.isExternal || this.externalPattern.match(node.filename);
            }

            if (this.isExternal && this.settings.excludeExternals) {
                return;
            }

            this.isDeclaration = ts.isDeclarationFile(node);
            if (this.isDeclaration) {
                var lib = this.converter.getDefaultLib();
                var isLib = node.filename.substr(-lib.length) == lib;
                if (!this.settings.includeDeclarations || isLib) {
                    return;
                }
            }

            this.trigger(Converter.EVENT_FILE_BEGIN, this.project, node);

            callback();
        }


        /**
         * Apply all children of the given node to the given target reflection.
         *
         * @param node     The node whose children should be analyzed.
         * @param typeArguments
         * @return The resulting reflection.
         */
        inherit(node:ts.Node, typeArguments?:ts.NodeArray<ts.TypeNode>):Reflection {
            var wasInherit = this.isInherit;
            var oldInherited = this.inherited;
            var oldInheritParent = this.inheritParent;
            var oldTypeArguments = this.typeArguments;
            this.isInherit = true;
            this.inheritParent = node;
            this.inherited = [];

            if (typeArguments) {
                this.typeArguments = [];
                typeArguments.forEach((node:ts.TypeNode) => {
                    this.typeArguments.push(convertType(this, node, this.checker.getTypeAtLocation(node)));
                });
            } else {
                this.typeArguments = null;
            }

            var target = <ContainerReflection>this.scope;
            if (!(target instanceof ContainerReflection)) {
                throw new Error('Expected container reflection');
            }

            if (target.children) target.children.forEach((child) => {
                this.inherited.push(child.name);
            });

            visit(this, node);

            this.isInherit = wasInherit;
            this.inherited = oldInherited;
            this.inheritParent = oldInheritParent;
            this.typeArguments = oldTypeArguments;
            return target;
        }
    }
}