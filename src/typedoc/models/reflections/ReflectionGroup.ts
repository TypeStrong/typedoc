module TypeDoc.Models
{
    export class ReflectionGroup
    {
        title:string;

        kind:TypeScript.PullElementKind;

        children:DeclarationReflection[] = [];

        allChildrenHaveOwnDocument:any;


        constructor(title:string, kind:TypeScript.PullElementKind) {
            this.title = title;
            this.kind = kind;

            this.allChildrenHaveOwnDocument = (() => {
                var res = this.getAllChildrenHaveOwnDocument();
                this.allChildrenHaveOwnDocument = res;
                return res;
            });
        }


        private getAllChildrenHaveOwnDocument():boolean {
            var onlyOwnDocuments = true;
            this.children.forEach((child) => {
                onlyOwnDocuments = onlyOwnDocuments && child.hasOwnDocument;
            });
            return onlyOwnDocuments;
        }
    }
}