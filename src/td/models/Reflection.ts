/**
 * Holds all data models used by TypeDoc.
 *
 * The [[BaseReflection]] is base class of all reflection models. The subclass [[ProjectReflection]]
 * serves as the root container for the current project while [[DeclarationReflection]] instances
 * form the structure of the project. Most of the other classes in this namespace are referenced by this
 * two base classes.
 *
 * The models [[NavigationItem]] and [[UrlMapping]] are special as they are only used by the [[Renderer]]
 * while creating the final output.
 */
module td
{
    /**
     * Current reflection id.
     */
    var REFLECTION_ID:number = 0;

    /**
     * Defines the available reflection kinds.
     */
    export enum ReflectionKind
    {
        Global = 0,
        ExternalModule = 1,
        Module = 2,
        Enum = 4,
        EnumMember = 16,
        Variable = 32,
        Function = 64,
        Class = 128,
        Interface = 256,
        Constructor = 512,
        Property = 1024,
        Method = 2048,
        CallSignature = 4096,
        IndexSignature = 8192,
        ConstructorSignature = 16384,
        Parameter = 32768,
        TypeLiteral = 65536,
        TypeParameter = 131072,
        Accessor = 262144,
        GetSignature = 524288,
        SetSignature = 1048576,
        ObjectLiteral = 2097152,

        ClassOrInterface = Class | Interface,
        VariableOrProperty = Variable | Property,
        FunctionOrMethod = Function | Method,
        SomeSignature = CallSignature | IndexSignature | ConstructorSignature | GetSignature | SetSignature,
        SomeModule = Module | ExternalModule
    }


    export interface IDefaultValueContainer extends Reflection
    {
        defaultValue:string;
    }


    export interface ITypeContainer extends Reflection
    {
        type:Type;
    }


    export interface ITypeParameterContainer extends Reflection
    {
        typeParameters:TypeParameterReflection[];
    }


    export enum TraverseProperty {
        Children,
        Parameters,
        TypeLiteral,
        TypeParameter,
        ConstructorSignatures,
        CallSignatures,
        IndexSignature,
        GetSignature,
        SetSignature
    }


    export interface ITraverseCallback
    {
        (reflection:Reflection, property:TraverseProperty):void;
    }


    export interface ILocation
    {
        /**
         * The url of this reflection in the generated documentation.
         */
        url:string;

        /**
         * The name of the anchor of this child.
         */
        anchor?:string;

        /**
         * Is the url pointing to an individual document?
         *
         * When FALSE, the url points to an anchor tag on a page of a different reflection.
         */
        hasOwnDocument?:boolean;

        /**
         * A list of generated css classes that should be applied to representations of this
         * reflection in the generated markup.
         */
        cssClasses?:string;
    }


    /**
     * Base class for all reflection classes.
     *
     * While generating a documentation, TypeDoc generates an instance of [[ProjectReflection]]
     * as the root for all reflections within the project. All other reflections are represented
     * by the [[DeclarationReflection]] class.
     *
     * This base class exposes the basic properties one may use to traverse the reflection tree.
     * You can use the [[children]] and [[parent]] properties to walk the tree. The [[groups]] property
     * contains a list of all children grouped and sorted for being rendered.
     */
    export class Reflection
    {
        /**
         * Unique id of this reflection.
         */
        id:number;

        /**
         * The symbol name of this reflection.
         */
        name:string = '';

        /**
         * The original name of the TypeScript declaration.
         */
        originalName:string;

        /**
         * The kind of this reflection.
         */
        kind:ReflectionKind;

        /**
         * The human readable string representation of the kind of this reflection.
         */
        kindString:string;

        /**
         * The reflection this reflection is a child of.
         */
        parent:Reflection;

        /**
         * The parsed documentation comment attached to this reflection.
         */
        comment:Comment;

        /**
         * A list of all source files that contributed to this reflection.
         */
        sources:ISourceReference[];

        location:ILocation;

        /**
         * Url safe alias for this reflection.
         *
         * @see [[BaseReflection.getAlias]]
         */
        private _alias:string;



        /**
         * Create a new BaseReflection instance.
         */
        constructor(parent?:Reflection, name?:string, kind?:ReflectionKind) {
            this.id     = REFLECTION_ID++;
            this.parent = parent;
            this.name   = name;
            this.originalName = name;
            this.kind   = kind;
        }


        /**
         * @param kind  The kind to test for.
         */
        kindOf(kind:ReflectionKind):boolean;

        /**
         * @param kind  An array of kinds to test for.
         */
        kindOf(kind:ReflectionKind[]):boolean;

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
         * Return the full name of this reflection.
         *
         * The full name contains the name of this reflection and the names of all parent reflections.
         *
         * @param separator  Separator used to join the names of the reflections.
         * @returns The full name of this reflection.
         */
        getFullName(separator:string = '.'):string {
            if (this.parent && !(this.parent instanceof ProjectReflection)) {
                return this.parent.getFullName(separator) + separator + this.name;
            } else {
                return this.name;
            }
        }


        /**
         * Return an url safe alias for this reflection.
         */
        getAlias():string {
            if (!this._alias) {
                this._alias = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                if (this._alias == '') {
                    this._alias = 'node-' + this.id;
                }
            }

            return this._alias;
        }


        /**
         * Has this reflection a visible comment?
         *
         * @returns TRUE when this reflection has a visible comment.
         */
        hasComment():boolean {
            return <boolean>(this.comment && this.comment.hasVisibleComponent());
        }


        /**
         * @param name  The name of the child to look for. Might contain a hierarchy.
         */
        getChildByName(name:string):Reflection;

        /**
         * @param names  The name hierarchy of the child to look for.
         */
        getChildByName(names:string[]):Reflection;

        /**
         * Return a child by its name.
         *
         * @returns The found child or NULL.
         */
        getChildByName(arg:any):Reflection {
            var names:string[] = Array.isArray(arg) ? arg : arg.split('.');
            var name = names[0];

            this.traverse((child) => {
                if (child.name == name) {
                    if (names.length <= 1) {
                        return child;
                    } else if (child) {
                        return child.getChildByName(names.slice(1));
                    }
                }
            });

            return null;
        }


        /**
         * @param name  The name to look for. Might contain a hierarchy.
         */
        findReflectionByName(name:string):Reflection;

        /**
         * @param names  The name hierarchy to look for.
         */
        findReflectionByName(names:string[]):Reflection;

        /**
         * Try to find a reflection by its name.
         *
         * @return The found reflection or null.
         */
        findReflectionByName(arg:any):Reflection {
            var names:string[] = Array.isArray(arg) ? arg : arg.split('.');

            var reflection = this.getChildByName(names);
            if (reflection) {
                return reflection;
            } else {
                return this.parent.findReflectionByName(names);
            }
        }


        /**
         * Traverse all potential child reflections of this reflection.
         *
         * The given callback will be invoked for all children, signatures and type parameters
         * attached to this reflection.
         *
         * @param callback  The callback function that should be applied for each child reflection.
         */
        traverse(callback:ITraverseCallback) { }


        /**
         * Return a raw object representation of this reflection.
         */
        toObject():any {
            var result:any = {
                id:         this.id,
                name:       this.name,
                kind:       this.kind,
                kindString: this.kindString,
                alias:      this.getAlias()
            };

            if (this.originalName != this.name) {
                result.originalName = this.originalName;
            }

            if (this.comment) {
                result.comment = this.comment.toObject();
            }

            this.traverse((child, property) => {
                var name = TraverseProperty[property];
                name = name.substr(0, 1).toLowerCase() + name.substr(1);
                if (!result[name]) result[name] = [];
                result[name].push(child.toObject());
            });

            return result;
        }


        /**
         * Return a string representation of this reflection.
         */
        toString():string {
            return ReflectionKind[this.kind] + ' ' + this.name;
        }


        /**
         * Return a string representation of this reflection and all of its children.
         *
         * @param indent  Used internally to indent child reflections.
         */
        toStringHierarchy(indent:string = '') {
            var lines = [indent + this.toString()];

            indent += '  ';
            this.traverse((child, property) => {
                lines.push(child.toStringHierarchy(indent));
            });

            return lines.join('\n');
        }
    }
}