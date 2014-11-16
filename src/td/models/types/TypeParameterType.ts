module td
{
    export class TypeParameterType extends Type
    {
        name:string;

        constraint:Type;


        toString() {
            return this.name;
        }
    }
}