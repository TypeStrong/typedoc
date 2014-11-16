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
    export class DeclarationReflection extends ContainerReflection implements ISourceContainer, ICommentContainer, IDefaultValueContainer, ITypeContainer, ITypeParameterContainer
    {
        comment:Comment;

        /**
         * The type of the reflection.
         *
         * If the reflection represents a variable or a property, this is the value type.<br />
         * If the reflection represents a signature, this is the return type.
         */
        type:Type;

        typeParameters:TypeParameterType[];

        /**
         * A list of all source files that contributed to this reflection.
         */
        sources:ISourceReference[];

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
         * Contains a simplified representation of the type hierarchy suitable for being
         * rendered in templates.
         */
        typeHierarchy:IDeclarationHierarchy;

        /**
         * A list of generated css classes that should be applied to representations of this
         * reflection in the generated markup.
         */
        cssClasses:string;



        /**
         * @param kind  The kind to test for.
        kindOf(kind:TypeScript.PullElementKind):boolean;
         */

        /**
         * @param kind  An array of kinds to test for.
        kindOf(kind:TypeScript.PullElementKind[]):boolean;
         */

        /**
         * Test whether this reflection is of the given kind.
        kindOf(kind:any):boolean {
            if (Array.isArray(kind)) {
                for (var i = 0, c = kind.length; i < c; i++) {
                    if ((this.kind & kind[i]) !== 0) {
                        return true;
                    }
                }
                return false;
            } else {
                return (this.kind & kind) !== 0;
            }
        }
         */


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
         * Return a string representation of this reflection.
         */
        toString() {
            return super.toString() + (this.type ? ':' + this.type.toString() :  '');
        }


        /**
         * Return a string representation of this reflection and all of its children.
         *
         * @param indent  Used internally to indent child reflections.
         */
        toStringHierarchy(indent:string = '') {
            var lines = [indent + this.toString()];
            indent += '  ';

            if (this.typeParameters) {
                this.typeParameters.forEach((n) => { lines.push(indent + n.toString()); });
            }

            if (this.type instanceof ReflectionType) {
                lines.push((<ReflectionType>this.type).declaration.toStringHierarchy(indent));
            }

            if (this.constructorSignatures) {
                this.constructorSignatures.forEach((n) => { lines.push(n.toStringHierarchy(indent)); });
            }

            if (this.indexSignature) {
                lines.push(this.indexSignature.toStringHierarchy(indent));
            }

            if (this.getSignature) {
                lines.push(this.getSignature.toStringHierarchy(indent));
            }

            if (this.setSignature) {
                lines.push(this.setSignature.toStringHierarchy(indent));
            }

            if (this.callSignatures) {
                this.callSignatures.forEach((n) => { lines.push(n.toStringHierarchy(indent)); });
            }

            if (this.children) {
                for (var key in this.children) {
                    lines.push(this.children[key].toStringHierarchy(indent));
                }
            }

            return lines.join('\n');
        }
    }
}