module td
{
    export class ReferenceType extends Type
    {
        symbolID:number;

        reflection:Reflection;


        constructor(symbolID:number) {
            super();
            this.symbolID = symbolID;
        }


        toString() {
            if (this.reflection) {
                return this.reflection.name + (this.isArray ? '[]' : '');
            } else {
                return '=> ' + this.symbolID + (this.isArray ? '[]' : '');
            }
        }
    }
}