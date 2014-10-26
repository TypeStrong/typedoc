module TypeDoc.Models
{
    export class StringConstantType extends BaseType
    {
        value:string;


        constructor(value:string) {
            super();
            this.value = value;
        }


        toString():string {
            return '"' + this.value + '"';
        }
    }
}