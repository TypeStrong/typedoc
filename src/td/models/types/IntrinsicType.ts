module td
{
    export class IntrinsicType extends Type
    {
        name:string;


        constructor(name:string) {
            super();
            this.name = name;
        }


        toString() {
            return this.name + (this.isArray ? '[]' : '');
        }
    }
}