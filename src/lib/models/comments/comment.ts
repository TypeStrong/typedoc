import { CommentTag } from './tag';

/**
 * A model that represents a javadoc comment.
 *
 * Instances of this model are created by the [[CommentHandler]]. You can retrieve comments
 * through the [[BaseReflection.comment]] property.
 */
export class Comment {
    /**
     * The abstract of the comment. TypeDoc interprets the first paragraph of a comment
     * as the abstract.
     */
    shortText: string;

    /**
     * The full body text of the comment. Excludes the [[shortText]].
     */
    text: string;

    /**
     * The text of the ```@returns``` tag if present.
     */
    returns?: string;

    /**
     * All associated javadoc tags.
     */
    tags?: CommentTag[];

    /**
     * Creates a new Comment instance.
     */
    constructor(shortText?: string, text?: string) {
        this.shortText = shortText || '';
        this.text = text || '';
    }

    /**
     * Has this comment a visible component?
     *
     * @returns TRUE when this comment has a visible component.
     */
    hasVisibleComponent(): boolean {
        return !!this.shortText || !!this.text || !!this.tags;
    }

    /**
     * Test whether this comment contains a tag with the given name.
     *
     * @param tagName  The name of the tag to look for.
     * @returns TRUE when this comment contains a tag with the given name, otherwise FALSE.
     */
    hasTag(tagName: string): boolean {
        if (!this.tags) {
            return false;
        }
        for (let i = 0, c = this.tags.length; i < c; i++) {
            if (this.tags[i].tagName === tagName) {
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
     * @returns The found tag or undefined.
     */
    getTag(tagName: string, paramName?: string): CommentTag | undefined {
        return (this.tags || []).find(tag => {
            return tag.tagName === tagName && (paramName === void 0 || tag.paramName === paramName);
        });
    }

    /**
     * Removes all tags with the given tag name from teh comment.
     * @param tagName
     */
    removeTags(tagName: string) {
        if (!this.tags) {
            return;
        }

        let i = 0, c = this.tags.length ?? 0;
        while (i < c) {
            if (this.tags[i].tagName === tagName) {
                this.tags.splice(i, 1);
                c--;
            } else {
                i++;
            }
        }
    }

    /**
     * Copy the data of the given comment into this comment.
     *
     * @param comment
     */
    copyFrom(comment: Comment) {
        this.shortText = comment.shortText;
        this.text = comment.text;
        this.returns = comment.returns;
        this.tags = comment.tags ? comment.tags.map((tag) => new CommentTag(tag.tagName, tag.paramName, tag.text)) : undefined;
    }
}
