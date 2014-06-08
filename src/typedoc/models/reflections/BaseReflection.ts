module TypeDoc.Models
{
    /**
     * Base class for all reflection classes.
     *
     * While generating a documentation, TypeDoc creates an instance of the ProjectReflection
     * as the root for all reflections within the project. All other reflections are represented
     * by the DeclarationReflection class.
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

        /**
         * All children grouped by their kind.
         */
        groups:ReflectionGroup[];

        /**
         * The symbol name of this reflection.
         */
        name:string = '';

        /**
         * The parsed documentation comment attached to this reflection.
         */
        comment:Comment;

        /**
         * The url of this reflection in the generated documentation.
         */
        url:string;

        /**
         * Is the url pointing to an individual document?
         *
         * When FALSE, the url points to an anchor tag on a page of a different reflection.
         */
        hasOwnDocument:boolean = false;

        /**
         * Url safe alias for this reflection.
         *
         * @see BaseReflection.getAlias
         */
        private alias:string;



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
         * Return a child by its name.
         *
         * @param name  The name of the child to look for. Might contain a hierarchy.
         * @returns     The found child or NULL.
         */
        getChildByName(name:string):DeclarationReflection;

        /**
         * Return a child by its name.
         *
         * @param names  The name hierarchy of the child to look for.
         * @returns      The found child or NULL.
         */
        getChildByName(names:string[]):DeclarationReflection;

        getChildByName(arg:any):DeclarationReflection {
            var names:string[] = Array.isArray(arg) ? arg : arg.split('.');
            var name = names[0];

            for (var i = 0, c = this.children.length; i < c; i++) {
                var child = this.children[i];
                if (child.name == name) {
                    if (names.length <= 1) {
                        return child;
                    } else {
                        return child.getChildByName(names.slice(1));
                    }
                }
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
                this.alias = this.alias.replace(/[:\\\/]/g, '-');
            }

            return this.alias;
        }


        /**
         * Try to find a reflection by its name.
         *
         * @param name  The name to look for. Might contain a hierarchy.
         * @return      The found reflection or null.
         */
        findReflectionByName(name:string):DeclarationReflection;

        /**
         * Try to find a reflection by its name.
         *
         * @param names  The name hierarchy to look for.
         * @return       The found reflection or null.
         */
        findReflectionByName(names:string[]):DeclarationReflection;

        findReflectionByName(arg:any):DeclarationReflection {
            var names:string[] = Array.isArray(arg) ? arg : arg.split('.');

            var reflection = this.getChildByName(names);
            if (reflection) {
                return reflection;
            } else {
                return this.parent.findReflectionByName(names);
            }
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