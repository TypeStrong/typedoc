module TypeDoc.Models
{
    /**
     * Alias to TypeScript.PullElementKind
     *
     * @resolve
     */
    export var Kind = TypeScript.PullElementKind;

    /**
     * Alias to TypeScript.PullElementFlags
     *
     * @resolve
     */
    export var Flags = TypeScript.PullElementFlags;


    /**
     * Stores hierarchical type data.
     *
     * @see [[DeclarationReflection.typeHierarchy]]
     */
    export interface IDeclarationHierarchy
    {
        /**
         * The type represented by this node in the hierarchy.
         */
        type:BaseType;

        /**
         * A list of a children of this node.
         */
        children?:IDeclarationHierarchy[];

        /**
         * Is this the entry within the type hierarchy of the target type?
         */
        isTarget?:boolean;
    }


    /**
     * Represents references of reflections to their defining source files.
     *
     * @see [[DeclarationReflection.sources]]
     */
    export interface IDeclarationSource
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
    }


    /**
     * A reflection that represents a single declaration emitted by the TypeScript compiler.
     *
     * All parts of a project are represented by DeclarationReflection instances. The actual
     * kind of a reflection is stored in its ´kind´ member.
     */
    export class DeclarationReflection extends BaseReflection
    {
        /**
         * The definition of the underlying symbol.
         *
         * This is a string representation of the declaration which can be used
         * in templates, when no other presentation of this declaration is available.
         */
        definition:string;

        /**
         * A list of function signatures attached to this declaration.
         *
         * TypeDoc creates one declaration per function that may contain ore or more
         * signature reflections.
         */
        signatures:DeclarationReflection[];

        /**
         * The type of the reflection.
         *
         * If the reflection represents a variable or a property, this is the value type.<br />
         * If the reflection represents a signature, this is the return type.
         */
        type:BaseType;

        /**
         * A list of all types this reflection extends (e.g. the parent classes).
         */
        extendedTypes:BaseType[];

        /**
         * A list of all types that extend this reflection (e.g. the subclasses).
         */
        extendedBy:BaseType[];

        /**
         * A bitmask containing the flags of this reflection as returned by the compiler.
         */
        flags:TypeScript.PullElementFlags = Flags.None;

        /**
         * An array representation of the flags bitmask, containing only the flags relevant for documentation.
         */
        flagsArray:any;

        /**
         * The kind of this reflection as returned by the compiler.
         */
        kind:TypeScript.PullElementKind = Kind.None;

        /**
         * The human readable string representation of the kind of this reflection.
         */
        kindString:string;

        /**
         * A list of all source files that contributed to this reflection.
         */
        sources:IDeclarationSource[] = [];

        /**
         * The default value of this reflection.
         *
         * Applies to function parameters.
         */
        defaultValue:string;

        /**
         * Is this a signature reflection?
         */
        isSignature:boolean;

        /**
         * Whether this reflection is an optional component or not.
         *
         * Applies to function parameters and object members.
         */
        isOptional:boolean;

        /**
         * Is this a private member?
         */
        isPrivate:boolean;

        /**
         * Is this a static member?
         */
        isStatic:boolean;

        /**
         * Is this member exported?
         */
        isExported:boolean;

        /**
         * Contains a simplified representation of the type hierarchy suitable for being
         * rendered in templates.
         */
        typeHierarchy:IDeclarationHierarchy;

        /**
         * A type that points to the reflection that has been overwritten by this reflection.
         *
         * Applies to interface and class members.
         */
        overwrites:BaseType;

        /**
         * A type that points to the reflection this reflection has been inherited from.
         *
         * Applies to interface and class members.
         */
        inheritedFrom:BaseType;

        /**
         * A list of generated css classes that should be applied to representations of this
         * reflection in the generated markup.
         */
        cssClasses:string;



        /**
         * @param kind  The kind to test for.
         */
        kindOf(kind:TypeScript.PullElementKind):boolean;

        /**
         * @param kind  An array of kinds to test for.
         */
        kindOf(kind:TypeScript.PullElementKind[]):boolean;

        /**
         * Test whether this reflection is of the given kind.
         */
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


        /**
         * Return a string representation of this reflection.
         */
        toString():string {
            var str = TypeScript.PullElementKind[this.kind] + ': ' + this.name;
            if (this.flags) str += ' [' + DeclarationReflection.flagsToString(this.flags, TypeScript.PullElementFlags) + ']';
            if (this.type) str += ': ' + this.type.toString();
            return str;
        }


        /**
         * Return a string representation of this reflection and all of its children.
         *
         * @param indent  Used internally to indent child reflections.
         */
        toReflectionString(indent:string = ''):string {
            var str = indent + this.toString();
            indent += '  ';

            if (this.signatures) {
                for (var i = 0, c = this.signatures.length; i < c; i++) {
                    str += '\n' + this.signatures[i].toReflectionString(indent);
                }
            }

            for (var i = 0, c = this.children.length; i < c; i++) {
                str += '\n' + this.children[i].toReflectionString(indent);
            }

            return str;
        }


        /**
         * Return a string representation of the given value based upon the given enumeration.
         *
         * @param value        The value that contains the bit mask that should be explained.
         * @param enumeration  The enumeration the bits in the value correspond to.
         * @param separator    A string used to concat the found flags.
         * @returns            A string representation of the given value.
         */
        static flagsToString(value:number, enumeration:any, separator:string = ', '):string {
            var values = [];
            for (var key in enumeration) {
                var num = +key;
                if (num != key || num == 0 || !enumeration.hasOwnProperty(key)) continue;
                if ((value & num) != num) continue;
                values.push(enumeration[+key]);
            }
            return values.join(separator);
        }
    }
}