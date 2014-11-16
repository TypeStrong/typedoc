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

        ClassOrInterface = Class | Interface,
        VariableOrProperty = Variable | Property,
        FunctionOrMethod = Function | Method,
        SomeSignature = CallSignature | IndexSignature | ConstructorSignature
    }


    export interface ISourceContainer extends Reflection
    {
        sources:ISourceReference[];
    }


    export interface ICommentContainer extends Reflection
    {
        comment:Comment;
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
        typeParameters:TypeParameterType[];
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
        // comment:Comment;

        /**
         * The url of this reflection in the generated documentation.
         */
        // url:string;

        /**
         * The name of the anchor of this child.
         */
        // anchor:string;

        /**
         * Is the url pointing to an individual document?
         *
         * When FALSE, the url points to an anchor tag on a page of a different reflection.
         */
        // hasOwnDocument:boolean = false;

        /**
         * Is this a declaration from an external document?
         */
        // isExternal:boolean;

        /**
         * Url safe alias for this reflection.
         *
         * @see [[BaseReflection.getAlias]]
         */
        // private alias:string;



        /**
         * Create a new BaseReflection instance.
         */
        constructor(parent?:Reflection, name?:string, kind?:ReflectionKind) {
            this.id     = REFLECTION_ID++;
            this.parent = parent;
            this.name   = name;
            this.kind   = kind;
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
        getAlias():string {
            if (!this.alias) {
                this.alias = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                if (this.alias == '') {
                    this.alias = 'symbol-' + this.id;
                }
            }

            return this.alias;
        }
         */


        /**
         * Has this reflection a visible comment?
         *
         * @returns TRUE when this reflection has a visible comment.
        hasComment():boolean {
            return <boolean>(this.comment && this.comment.hasVisibleComponent());
        }
         */


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
            return indent + this.toString();
        }
    }
}