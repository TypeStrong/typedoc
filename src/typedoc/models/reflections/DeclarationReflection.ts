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


    export interface IHierarchy {
        type:BaseType;
        children?:IHierarchy[];
    }


    export interface ISource {
        fileName:string;
        file?:SourceFile;
        line:number;
    }


    export class DeclarationReflection extends BaseReflection
    {
        definition:string;

        signatures:DeclarationReflection[];

        type:BaseType;

        extendedTypes:BaseType[];

        extendedBy:BaseType[];

        kind:TypeScript.PullElementKind = Kind.None;

        kindString:string;

        flags:TypeScript.PullElementFlags = Flags.None;

        sources:ISource[] = [];

        defaultValue:string;

        isOptional:boolean;

        overwrites:BaseType;

        inheritedFrom:BaseType;

        flagsArray:any;

        typeHierarchy:any;

        cssClasses:any;


        constructor() {
            super();
            this.cssClasses    = () => this.getCssClasses();
            this.flagsArray    = () => this.getFlagsArray();
            this.typeHierarchy = () => this.getTypeHierarchy();
        }


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


        getTypeHierarchy() {
            if (!this.extendedTypes && !this.extendedBy) return null;
            var root:IHierarchy, item:IHierarchy, hierarchy:IHierarchy;

            function push(item:IHierarchy) {
                if (hierarchy) {
                    hierarchy.children = [item];
                    hierarchy = item;
                } else {
                    root = hierarchy = item;
                }
            }

            if (this.extendedTypes) {
                this.extendedTypes.forEach((type) => {
                    push({type:type});
                });
            }

            item = {type:new ReflectionType(this, false)};
            if (this.extendedBy) {
                item.children = [];
                this.extendedBy.forEach((type) => {
                    item.children.push({type:type})
                });
            }
            push(item);

            return root;
        }


        getCssClasses():string {
            var flags = <any>Flags, classes = [];
            classes.push(classify('ts-kind-'+ Kind[this.kind]));

            if (this.parent && this.parent instanceof DeclarationReflection) {
                classes.push(classify('ts-parent-kind-'+ Kind[(<DeclarationReflection>this.parent).kind]));
            }

            for (var key in flags) {
                var num = +key;
                if (num != key || num == 0 || !flags.hasOwnProperty(key)) continue;
                if ((this.flags & num) != num) continue;
                classes.push(classify('ts-flag-'+ flags[+key]));
            }

            if (this.inheritedFrom) {
                classes.push('tsd-is-inherited');
            }

            if (this.flags & Flags.Private) {
                classes.push('tsd-is-private');
            }

            var isExported = false, reflection = this;
            if (reflection.kindOf(Kind.SomeContainer)) isExported = true;
            while (!isExported && reflection && reflection instanceof DeclarationReflection) {
                if (reflection.kindOf(Kind.SomeContainer)) break;
                isExported = ((reflection.flags & Flags.Exported) == Flags.Exported);
                reflection = <DeclarationReflection>reflection.parent;
            }

            if (!isExported) {
                classes.push('tsd-is-not-exported');
            }

            return classes.join(' ');
        }


        getFlagsArray() {
            var flags = <any>Flags, array = [];
            for (var key in flags) {
                var num = +key;
                if (num != key || num == 0 || !flags.hasOwnProperty(key)) continue;
                if ((this.flags & num) != num) continue;
                array.push(classify(flags[+key]));
            }

            return array;
        }


        /**
         * Return a string representation of this reflection.
         */
        toString():string {
            var str = TypeScript.PullElementKind[this.kind] + ': ' + this.name;
            if (this.flags) str += ' [' + flagsToString(this.flags, TypeScript.PullElementFlags) + ']';
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
    }
}