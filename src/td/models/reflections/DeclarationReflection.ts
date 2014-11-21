module td
{
    /**
     * Stores hierarchical type data.
     *
     * @see [[DeclarationReflection.typeHierarchy]]
     */
    export interface IDeclarationHierarchy
    {
        /**
         * The types represented by this node in the hierarchy.
         */
        types:Type[];

        /**
         * The next hierarchy level.
         */
        next?:IDeclarationHierarchy;

        /**
         * Is this the entry containing the target type?
         */
        isTarget?:boolean;
    }


    /**
     * Represents references of reflections to their defining source files.
     *
     * @see [[DeclarationReflection.sources]]
     */
    export interface ISourceReference
    {
        /**
         * A reference to the corresponding file instance.
         */
        file?:SourceFile;

        /**
         * The filename of the source file.
         */
        fileName:string;

        /**
         * The number of the line that emitted the declaration.
         */
        line:number;

        character:number;

        /**
         * URL for displaying the source file.
         */
        url?:string;
    }


    /**
     * A reflection that represents a single declaration emitted by the TypeScript compiler.
     *
     * All parts of a project are represented by DeclarationReflection instances. The actual
     * kind of a reflection is stored in its ´kind´ member.
     */
    export class DeclarationReflection extends ContainerReflection implements IDefaultValueContainer, ITypeContainer, ITypeParameterContainer
    {
        /**
         * The type of the reflection.
         *
         * If the reflection represents a variable or a property, this is the value type.<br />
         * If the reflection represents a signature, this is the return type.
         */
        type:Type;

        typeParameters:TypeParameterReflection[];

        /**
         * A list of call signatures attached to this declaration.
         *
         * TypeDoc creates one declaration per function that may contain ore or more
         * signature reflections.
         */
        callSignatures:SignatureReflection[];

        /**
         * A list of constructor signatures attached to this declaration.
         *
         * TypeDoc creates one declaration per constructor that may contain ore or more
         * signature reflections.
         */
        constructorSignatures:SignatureReflection[];

        /**
         * The index signature of this declaration.
         */
        indexSignature:SignatureReflection;

        /**
         * The get signature of this declaration.
         */
        getSignature:SignatureReflection;

        /**
         * The set signature of this declaration.
         */
        setSignature:SignatureReflection;

        /**
         * The default value of this reflection.
         *
         * Applies to function parameters.
         */
        defaultValue:string;

        /**
         * Is this a private member?
         */
        isPrivate:boolean;

        /**
         * Is this a protected member?
         */
        isProtected:boolean;

        /**
         * Is this a public member?
         */
        isPublic:boolean;

        /**
         * Is this a static member?
         */
        isStatic:boolean;

        /**
         * Is this member exported?
         */
        isExported:boolean;

        /**
         * Is this a declaration from an external document?
         */
        isExternal:boolean;

        /**
         * Whether this reflection is an optional component or not.
         *
         * Applies to function parameters and object members.
         */
        isOptional:boolean;

        /**
         * A type that points to the reflection that has been overwritten by this reflection.
         *
         * Applies to interface and class members.
         */
        overwrites:Type;

        /**
         * A type that points to the reflection this reflection has been inherited from.
         *
         * Applies to interface and class members.
         */
        inheritedFrom:Type;

        /**
         * A list of all types this reflection extends (e.g. the parent classes).
         */
        extendedTypes:Type[];

        /**
         * A list of all types that extend this reflection (e.g. the subclasses).
         */
        extendedBy:Type[];

        /**
         * A list of all types this reflection implements.
         */
        implementedTypes:Type[];

        /**
         * A list of all types that implement this reflection.
         */
        implementedBy:Type[];

        /**
         * Contains a simplified representation of the type hierarchy suitable for being
         * rendered in templates.
         */
        typeHierarchy:IDeclarationHierarchy;



        /**
         * Is this reflection representing a container like a module or class?
        isContainer() {
            return this.kindOf(TypeScript.PullElementKind.SomeContainer);
        }
         */
        getAllSignatures():SignatureReflection[] {
            var result = [];

            if (this.callSignatures) result = result.concat(this.callSignatures);
            if (this.constructorSignatures) result = result.concat(this.constructorSignatures);
            if (this.indexSignature) result.push(this.indexSignature);
            if (this.getSignature) result.push(this.getSignature);
            if (this.setSignature) result.push(this.setSignature);

            return result;
        }


        /**
         * Traverse all potential child reflections of this reflection.
         *
         * The given callback will be invoked for all children, signatures and type parameters
         * attached to this reflection.
         *
         * @param callback  The callback function that should be applied for each child reflection.
         */
        traverse(callback:ITraverseCallback) {
            if (this.typeParameters) {
                this.typeParameters.forEach((parameter) => callback(parameter, TraverseProperty.TypeParameter));
            }

            if (this.type instanceof ReflectionType) {
                callback((<ReflectionType>this.type).declaration, TraverseProperty.TypeLiteral);
            }

            if (this.constructorSignatures) {
                this.constructorSignatures.forEach((signature) => callback(signature, TraverseProperty.ConstructorSignatures));
            }

            if (this.indexSignature) {
                callback(this.indexSignature, TraverseProperty.IndexSignature);
            }

            if (this.getSignature) {
                callback(this.getSignature, TraverseProperty.GetSignature);
            }

            if (this.setSignature) {
                callback(this.setSignature, TraverseProperty.SetSignature);
            }

            if (this.callSignatures) {
                this.callSignatures.forEach((n) => callback(n, TraverseProperty.CallSignatures));
            }

            super.traverse(callback);
        }


        /**
         * Return a raw object representation of this reflection.
         */
        toObject():any {
            var result = super.toObject();



            return result;
        }


        /**
         * Return a string representation of this reflection.
         */
        toString():string {
            var result = super.toString();

            if (this.typeParameters) {
                var parameters = [];
                this.typeParameters.forEach((parameter) => parameters.push(parameter.name));
                result += '<' + parameters.join(', ') + '>';
            }

            if (this.type) {
                result += ':' + this.type.toString();
            }

            return result;
        }
    }
}