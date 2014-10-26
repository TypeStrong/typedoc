module TypeDoc.Models
{
    export class NamedType extends BaseType
    {
        name:string;


        constructor(name:string) {
            super();
            this.name = name;
        }


        toString():string {
            return this.name;
        }
    }
}