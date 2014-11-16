module td
{
    export class UnknownType extends Type
    {
        name:string;


        constructor(name:string) {
            super();
            this.name = name;
        }
    }
}