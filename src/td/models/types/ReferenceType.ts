module td
{
    export class ReferenceType extends Type
    {
        name:string;

        symbolID:number;

        reflection:Reflection;


        constructor(name:string, symbolID:number, reflection?:Reflection) {
            super();
            this.name = name;
            this.symbolID = symbolID;
            this.reflection = reflection;
        }


        toString() {
            if (this.reflection) {
                return this.reflection.name + (this.isArray ? '[]' : '');
            } else {
                return this.name + (this.isArray ? '[]' : '');
            }
        }
    }
}