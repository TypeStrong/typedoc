module td.models
{
    export class Container extends Reflection {
        /**
         * The children of this reflection.
         */
        children:Reflection[] = [];

        /**
         * All children grouped by their kind.
         */
        groups:ReflectionGroup[];



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

            for (var i = 0, c = this.children.length; i < c; i++) {
                var child = this.children[i];
                if (child.name == name) {
                    if (names.length <= 1) {
                        return child;
                    } else if (child instanceof Container) {
                        return (<Container>child).getChildByName(names.slice(1));
                    } else {
                        return null;
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
        getChildrenByKind(kind:ts.SyntaxKind):Reflection[] {
            var values = [];
            this.children.forEach((child) => {
                if (child.kindOf(kind)) {
                    values.push(child);
                }
            });
            return values;
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