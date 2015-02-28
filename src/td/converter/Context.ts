module td
{
    /**
     * The context describes the current state the converter is in.
     */
    export class Context
    {
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

        /**
         * Temporary
         */
        visit:{(context:Context, node:ts.Node):Reflection};
        extractType:{(context:Context, node:ts.Node, type:ts.Type):Type};
        createTypeParameter:{(context:Context, declaration:ts.TypeParameterDeclaration):TypeParameterType};


        /**
         * Create a new context.
         *
         * @param checker
         * @param project  The target project.
         */
        constructor(checker:ts.TypeChecker, project:ProjectReflection) {
            this.checker = checker;
            this.project = project;
            this.scope = project;
        }


        /**
         * Return the current parent reflection.
         */
        public getScope():Reflection {
            return this.scope;
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
                        typeParameters[name] = this.createTypeParameter(this, declaration);
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
                    this.typeArguments.push(this.extractType(this, node, this.checker.getTypeAtLocation(node)));
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

            this.visit(this, node);

            this.isInherit = wasInherit;
            this.inherited = oldInherited;
            this.inheritParent = oldInheritParent;
            this.typeArguments = oldTypeArguments;
            return target;
        }
    }
}