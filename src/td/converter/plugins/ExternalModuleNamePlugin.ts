module td.converter
{
    /**
     * This plugin allows an ES6 module to specify its TypeDoc name.
     * It also allows multiple ES6 modules to be merged together into a single TypeDoc module.
     *
     * @usage
     * At the top of an ES6 module, add a "dynamic module comment".  Insert "@module typedocModuleName" to
     * specify that this ES6 module should be merged with module: "typedocModuleName".
     *
     * Similar to the [[DynamicModulePlugin]], ensure that there is a comment tag (even blank) for the
     * first symbol in the file.
     *
     * @example
     * ```
     *
     * &#47;**
     *  * @module newModuleName
     *  *&#47;
     * &#47;** for typedoc &#47;
     * import {foo} from "../foo";
     * export let bar = "bar";
     * ```
     *
     * Also similar to [[DynamicModulePlugin]], if @preferred is found in a dynamic module comment, the comment
     * will be used as the module comment, and documentation will be generated from it (note: this plugin does not
     * attempt to count lengths of merged module comments in order to guess the best one)
     */
    export class ModuleAnnotationPlugin extends ConverterPlugin
    {
        /** List of module reflections which are models to rename */
        private moduleRenames: ModuleRename[];

        constructor(converter:Converter) {
            super(converter);
            converter.on(Converter.EVENT_BEGIN,              this.onBegin,        this);
            converter.on(Converter.EVENT_CREATE_DECLARATION, this.onDeclaration,  this);
            converter.on(Converter.EVENT_RESOLVE_BEGIN,      this.onBeginResolve, this);
        }

        /**
         * Triggered when the converter begins converting a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBegin(context:Context) {
            this.moduleRenames = [];
        }

        /**
         * Triggered when the converter has created a declaration reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onDeclaration(context:Context, reflection:models.Reflection, node?:ts.Node) {
            if (reflection.kindOf(models.ReflectionKind.ExternalModule)) {
                let comment = CommentPlugin.getComment(node);
                // Look for @module
                let match = /@module\s+(\w+)/.exec(comment);
                if (match) {
                    // Look for @preferred
                    let preferred = /@preferred/.exec(comment);
                    // Set up a list of renames operations to perform when the resolve phase starts
                    this.moduleRenames.push({
                        renameTo: match[1],
                        preferred: preferred != null,
                        reflection: <models.ContainerReflection> reflection
                    });
                }
            }
        }


        /**
         * Triggered when the converter begins resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBeginResolve(context:Context) {
            let projRefs = context.project.reflections;
            let refsArray: models.Reflection[] = Object.keys(projRefs).reduce((m,k) => {m.push(projRefs[k]); return m;}, []);

            // Process each rename
            this.moduleRenames.forEach(item => {
                let renaming = <models.ContainerReflection> item.reflection;
                // Find an existing module that already has the "rename to" name.  Use it as the merge target.
                let mergeTarget = <models.ContainerReflection>
                    refsArray.filter(ref => ref.kind === renaming.kind && ref.name === item.renameTo)[0];

                // If there wasn't a merge target, just change the name of the current module and exit.
                if (!mergeTarget) {
                    renaming.name = item.renameTo;
                    return;
                }

                // Since there is a merge target, relocate all the renaming module's children to the mergeTarget.
                let childrenOfRenamed = refsArray.filter(ref => ref.parent === renaming);
                childrenOfRenamed.forEach((ref: models.Reflection) => {
                    // update links in both directions
                    ref.parent = mergeTarget;
                    mergeTarget.children.push(<any> ref)
                });

                // If @preferred was found on the current item, update the mergeTarget's comment
                // with comment from the renaming module
                if (item.preferred)
                    mergeTarget.comment = renaming.comment;

                // Now that all the children have been relocated to the mergeTarget, delete the empty module
                // Make sure the module being renamed doesn't have children, or they will be deleted
                if (renaming.children)
                    renaming.children.length = 0;
                CommentPlugin.removeReflection(context.project, renaming);

                // Remove @module and @preferred from the comment, if found.
                CommentPlugin.removeTags(mergeTarget.comment, "module");
                CommentPlugin.removeTags(mergeTarget.comment, "preferred");
            });
        }
    }


    /**
     * Register this handler.
     */
    Converter.registerPlugin('moduleAnnotation', ModuleAnnotationPlugin);

    interface ModuleRename {
        renameTo: string;
        preferred: boolean;
        reflection: models.ContainerReflection;
    }
}