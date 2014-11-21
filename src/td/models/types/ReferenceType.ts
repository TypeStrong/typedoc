module td
{
    export class ReferenceType extends Type
    {
        symbolID:number;

        reflection:Reflection;


        constructor(symbolID:number, reflection?:Reflection) {
            super();
            this.symbolID = symbolID;
            this.reflection = reflection;
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