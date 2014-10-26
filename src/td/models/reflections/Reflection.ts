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
         * The reflection this reflection is a child of.
         */
        parent:Reflection;

        /**
         * The symbol name of this reflection.
         */
        name:string = '';

        /**
         * The original name of the TypeScript declaration.
         */
        originalName:string;

        /**
         * The parsed documentation comment attached to this reflection.
         */
        comment:Comment;

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
        hasOwnDocument:boolean = false;

        /**
         * Is this a declaration from an external document?
         */
        isExternal:boolean;

        /**
         * Url safe alias for this reflection.
         *
         * @see [[BaseReflection.getAlias]]
         */
        private alias:string;



        /**
         * Create a new BaseReflection instance.
         */
        constructor() {
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
            if (this.parent && !(this.parent instanceof Project)) {
                return this.parent.getFullName(separator) + separator + this.name;
            } else {
                return this.name;
            }
        }


        /**
         * Return an url safe alias for this reflection.
         */
        getAlias():string {
            if (!this.alias) {
                this.alias = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                if (this.alias == '') {
                    this.alias = 'symbol-' + this.id;
                }
            }

            return this.alias;
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
         * Return a string representation of this reflection.
         */
        toString():string {
            return 'Reflection';
        }


        /**
         * Return a string representation of this reflection and all of its children.
         *
         * @param indent  Used internally to indent child reflections.
         */
        toReflectionString(indent:string = ''):string {
            return indent + this.toString();
        }
    }
}