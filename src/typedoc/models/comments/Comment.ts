module TypeDoc.Models
{
    export class Comment
    {
        shortText:string;

        text:string;

        returns:string;

        tags:CommentTag[];


        constructor(shortText?:string, text?:string) {
            this.shortText = shortText || '';
            this.text = text || '';
        }


        hasTag(tag:string):boolean {
            if (!this.tags) return false;
            for (var i = 0, c = this.tags.length; i < c; i++) {
                if (this.tags[i].tagName == tag) {
                    return true;
                }
            }
            return false;
        }


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