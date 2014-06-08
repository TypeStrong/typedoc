module TypeDoc.Models
{
    /**
     * A model that represents a javadoc comment.
     *
     * Instances of this model are created by the [[CommentHandler]]. You can retrieve comments
     * through the [[BaseReflection.comment]] property.
     */
    export class Comment
    {
        /**
         * The abstract of the comment. TypeDoc interprets the first paragraph of a comment
         * as the abstract.
         */
        shortText:string;

        /**
         * The full body text of the comment. Excludes the [[shortText]].
         */
        text:string;

        /**
         * The text of the ```@returns``` tag if present.
         */
        returns:string;

        /**
         * All associated javadoc tags.
         */
        tags:CommentTag[];



        /**
         * Creates a new Comment instance.
         */
        constructor(shortText?:string, text?:string) {
            this.shortText = shortText || '';
            this.text = text || '';
        }


        /**
         * Test whether this comment contains a tag with the given name.
         *
         * @param tagName  The name of the tag to look for.
         * @returns TRUE when this comment contains a tag with the given name, otherwise FALSE.
         */
        hasTag(tagName:string):boolean {
            if (!this.tags) return false;
            for (var i = 0, c = this.tags.length; i < c; i++) {
                if (this.tags[i].tagName == tagName) {
                    return true;
                }
            }
            return false;
        }


        /**
         * Return the first tag with the given name.
         *
         * You can optionally pass a parameter name that should be searched to.
         *
         * @param tagName  The name of the tag to look for.
         * @param paramName  An optional parameter name to look for.
         * @returns The found tag or NULL.
         */
        getTag(tagName:string, paramName?:string):CommentTag {
            if (!this.tags) return null;
            for (var i = 0, c = this.tags.length; i < c; i++) {
                var tag = this.tags[i];
                if (tag.tagName == tagName && (!paramName || tag.paramName == paramName)) {
                    return this.tags[i];
                }
            }
            return null;
        }
    }
}