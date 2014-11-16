module td
{
    export class StringLiteralType extends Type
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