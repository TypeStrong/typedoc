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
module td.models
{
    /**
     * Current reflection id.
     */
    var REFLECTION_ID:number = 0;

    /**
     * Reset the reflection id.
     *
     * Used by the test cases to ensure the reflection ids won't change between runs.
     */
    export function resetReflectionID() {
        REFLECTION_ID = 0;
    }

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
        TypeAlias = 4194304,
        Event = 8388608,

        ClassOrInterface = Class | Interface,
        VariableOrProperty = Variable | Property,
        FunctionOrMethod = Function | Method,
        SomeSignature = CallSignature | IndexSignature | ConstructorSignature | GetSignature | SetSignature,
        SomeModule = Module | ExternalModule
    }


    export enum ReflectionFlag
    {
        Private = 1,
        Protected = 2,
        Public = 4,
        Static = 8,
        Exported = 16,
        ExportAssignment = 32,
        External = 64,
        Optional = 128,
        DefaultValue = 256,
        Rest = 512,
        ConstructorProperty = 1024
    }


    var relevantFlags:ReflectionFlag[] = [
        ReflectionFlag.Private,
        ReflectionFlag.Protected,
        ReflectionFlag.Static,
        ReflectionFlag.ExportAssignment,
        ReflectionFlag.Optional,
        ReflectionFlag.DefaultValue,
        ReflectionFlag.Rest
    ];


    export interface IReflectionFlags extends Array<string>
    {
        flags?:ReflectionFlag;

        /**
         * Is this a private member?
         */
        isPrivate?:boolean;

        /**
         * Is this a protected member?
         */
        isProtected?:boolean;

        /**
         * Is this a public member?
         */
        isPublic?:boolean;

        /**
         * Is this a static member?
         */
        isStatic?:boolean;

        /**
         * Is this member exported?
         */
        isExported?:boolean;

        /**
         * Is this a declaration from an external document?
         */
        isExternal?:boolean;

        /**
         * Whether this reflection is an optional component or not.
         *
         * Applies to function parameters and object members.
         */
        isOptional?:boolean;


        /**
         * Whether it's a rest parameter, like `foo(...params);`.
         */
        isRest?: boolean;

        /**
         *
         */
        hasExportAssignment?:boolean;

        isConstructorProperty?:boolean;
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
        Signatures,
        IndexSignature,
        GetSignature,
        SetSignature
    }


    export interface ITraverseCallback
    {
        (reflection:Reflection, property:TraverseProperty):void;
    }


    /**
     * Defines the usage of a decorator.
     */
    export interface IDecorator
    {
        /**
         * The name of the decorator being applied.
         */
        name:string;

        /**
         * The type declaring the decorator.
         * Usually a ReferenceType instance pointing to the decorator function.
         */
        type?:Type;

        /**
         * A named map of arguments the decorator is applied with.
         */
        arguments?:any;
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

        flags:IReflectionFlags = [];

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

        /**
         * A list of all decorators attached to this reflection.
         */
        decorators:IDecorator[];

        /**
         * A list of all types that are decorated by this reflection.
         */
        decorates:Type[];

        /**
         * The url of this reflection in the generated documentation.
         */
        url:string;

        /**
         * The name of the anchor of this child.
         */
        anchor:string;

        /**
         * Is the url pointing to an individual document?
         *
         * When FALSE, the url points to an anchor tag on a page of a different reflection.
         */
        hasOwnDocument:boolean;

        /**
         * A list of generated css classes that should be applied to representations of this
         * reflection in the generated markup.
         */
        cssClasses:string;

        /**
         * Url safe alias for this reflection.
         *
         * @see [[BaseReflection.getAlias]]
         */
        private _alias:string;

        private _aliases:string[];



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
         * Set a flag on this reflection.
         */
        setFlag(flag:ReflectionFlag, value:boolean = true) {
            var name, index;
            if (relevantFlags.indexOf(flag) != -1) {
                name = ReflectionFlag[flag];
                name = name.replace(/(.)([A-Z])/g, (m, a, b) => a + ' ' + b.toLowerCase());
                index = this.flags.indexOf(name);
            }

            if (value) {
                this.flags.flags |= flag;
                if (name && index == -1) {
                    this.flags.push(name);
                }
            } else {
                this.flags.flags &= ~flag;
                if (name && index != -1) {
                    this.flags.splice(index, 1);
                }
            }

            switch (flag) {
                case ReflectionFlag.Private:
                    this.flags.isPrivate = value;
                    if (value) {
                        this.setFlag(ReflectionFlag.Protected, false);
                        this.setFlag(ReflectionFlag.Public, false);
                    }
                    break;
                case ReflectionFlag.Protected:
                    this.flags.isProtected = value;
                    if (value) {
                        this.setFlag(ReflectionFlag.Private, false);
                        this.setFlag(ReflectionFlag.Public, false);
                    }
                    break;
                case ReflectionFlag.Public:
                    this.flags.isPublic = value;
                    if (value) {
                        this.setFlag(ReflectionFlag.Private, false);
                        this.setFlag(ReflectionFlag.Protected, false);
                    }
                    break;
                case ReflectionFlag.Static:
                    this.flags.isStatic = value;
                    break;
                case ReflectionFlag.Exported:
                    this.flags.isExported = value;
                    break;
                case ReflectionFlag.External:
                    this.flags.isExternal = value;
                    break;
                case ReflectionFlag.Optional:
                    this.flags.isOptional = value;
                    break;
                case ReflectionFlag.Rest:
                    this.flags.isRest = value;
                    break;
                case ReflectionFlag.ExportAssignment:
                    this.flags.hasExportAssignment = value;
                    break;
                case ReflectionFlag.ConstructorProperty:
                    this.flags.isConstructorProperty = value;
                    break;
            }
        }


        /**
         * Return an url safe alias for this reflection.
         */
        getAlias():string {
            if (!this._alias) {
                var alias = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                if (alias == '') {
                    alias = 'reflection-' + this.id;
                }

                var target = this;
                while (target.parent && !(target.parent instanceof ProjectReflection) && !target.hasOwnDocument) {
                    target = target.parent;
                }

                if (!target._aliases) target._aliases = [];
                var suffix = '', index = 0;
                while (target._aliases.indexOf(alias + suffix) != -1) {
                    suffix = '-' + (++index).toString();
                }

                alias += suffix;
                target._aliases.push(alias);
                this._alias = alias;
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


        hasGetterOrSetter():boolean {
            return false;
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
            var result = null;

            this.traverse((child) => {
                if (child.name == name) {
                    if (names.length <= 1) {
                        result = child;
                    } else if (child) {
                        result = child.getChildByName(names.slice(1));
                    }
                }
            });

            return result;
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
                flags:      {}
            };

            if (this.originalName != this.name) {
                result.originalName = this.originalName;
            }

            if (this.comment) {
                result.comment = this.comment.toObject();
            }

            for (var key in this.flags) {
                if (parseInt(key) == key || key == 'flags') continue;
                if (this.flags[key]) result.flags[key] = true;
            }

            if (this.decorates) {
                result.decorates = this.decorates.map((type) => type.toObject());
            }

            if (this.decorators) {
                result.decorators = this.decorators.map((decorator) => {
                    var result:any = { name:decorator.name };
                    if (decorator.type) result.type = decorator.type.toObject();
                    if (decorator.arguments) result.arguments = decorator.arguments;
                    return result;
                });
            }

            this.traverse((child, property) => {
                if (property == TraverseProperty.TypeLiteral) return;
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