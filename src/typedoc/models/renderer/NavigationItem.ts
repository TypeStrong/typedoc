module TypeDoc.Models
{
    export class NavigationItem
    {
        title:string;
        url:string;
        parent:NavigationItem;
        children:NavigationItem[];
        cssClasses:string;
        isCurrent:boolean = false;
        isInPath:boolean = false;
        isPrimary:boolean = false;

        constructor(title?:string, url?:string, parent?:NavigationItem) {
            this.title  = title  || '';
            this.url    = url    || '';
            this.parent = parent || null;

            if (this.parent) {
                if (!this.parent.children) this.parent.children = [];
                this.parent.children.push(this);
            }
        }
    }
}