module TypeDoc.Models
{
    /**
     * Check whether the given flag is set in the given value.
     *
     * @param value  The value that should be tested.
     * @param flag   The flag that should be looked for.
     */
    export function hasFlag(value:number, flag:number):boolean {
        return (value & flag) !== 0;
    }


    export function hasModifier(modifiers:TypeScript.PullElementFlags[], flag:TypeScript.PullElementFlags):boolean {
        for (var i = 0, n = modifiers.length; i < n; i++) {
            if (hasFlag(modifiers[i], flag)) {
                return true;
            }
        }

        return false;
    }


    export function classify(str:string) {
        return str.replace(/(\w)([A-Z])/g, (m, m1, m2) => m1 + '-' + m2).toLowerCase();
    }


    /**
     * Return a string representation of the given value based upon the given enumeration.
     *
     * @param value        The value that contains the bit mask that should be explained.
     * @param enumeration  The enumeration the bits in the value correspond to.
     * @param separator    A string used to concat the found flags.
     * @returns            A string representation of the given value.
     */
    export function flagsToString(value:number, enumeration:any, separator:string = ', '):string
    {
        var values = [];
        for (var key in enumeration) {
            var num = +key;
            if (num != key || num == 0 || !enumeration.hasOwnProperty(key)) continue;
            if ((value & num) != num) continue;
            values.push(enumeration[+key]);
        }
        return values.join(separator);
    }


    /**
     * Base class for all our reflection classes.
     */
    export class BaseReflection
    {
        /**
         * The reflection this reflection is a child of.
         */
        parent:BaseReflection;

        /**
         * The children of this reflection.
         */
        children:DeclarationReflection[] = [];

        groups:ReflectionGroup[];

        /**
         * The symbol name of this reflection.
         */
        name:string = '';

        comment:Comment;

        url:string;

        hasOwnDocument:boolean = false;


        private alias:string;


        /**
         * Create a new BaseReflection instance.
         */
            constructor() {
        }


        getFullName(separator:string = '.'):string {
            if (this.parent && !(this.parent instanceof ProjectReflection)) {
                return this.parent.getFullName(separator) + separator + this.name;
            } else {
                return this.name;
            }
        }


        /**
         * Return a child by its name.
         *
         * @param name  The name of the child to look for.
         * @returns     The found child or NULL.
         */
        getChildByName(name:string):DeclarationReflection {
            for (var i = 0, c = this.children.length; i < c; i++) {
                if (this.children[i].name == name) return this.children[i];
            }
            return null;
        }


        /**
         * Return a list of all children of a certain kind.
         *
         * @param kind  The desired kind of children.
         * @returns     An array containing all children with the desired kind.
         */
        getChildrenByKind(kind:TypeScript.PullElementKind):DeclarationReflection[] {
            var values = [];
            this.children.forEach((child) => {
                if (child.kindOf(kind)) {
                    values.push(child);
                }
            });
            return values;
        }


        /**
         * Return an url safe alias for this reflection.
         */
        getAlias():string {
            if (!this.alias) {
                this.alias = this.name.toLowerCase();
                this.alias = this.alias.replace(/\/\\:/g, '.');
                this.alias = this.alias.replace(/[\\\/]/g, '-');
            }

            return this.alias;
        }


        /**
         * Return a string representation of this reflection.
         */
        toString():string {
            return 'BaseReflection';
        }


        /**
         * Return a string representation of this reflection and all of its children.
         *
         * @param indent  Used internally to indent child reflections.
         */
        toReflectionString(indent:string = ''):string {
            var str = indent + this.toString();
            indent += '  ';
            for (var i = 0, c = this.children.length; i < c; i++) {
                str += '\n' + this.children[i].toReflectionString(indent);
            }
            return str;
        }
    }
}