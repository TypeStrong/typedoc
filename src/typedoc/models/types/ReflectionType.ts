module TypeDoc.Models
{
    export class ReflectionType extends BaseType
    {
        reflection:DeclarationReflection;

        isArray:boolean;


        constructor(reflection:DeclarationReflection, isArray:boolean) {
            super();
            this.reflection = reflection;
            this.isArray = isArray;
        }


        toString():string {
            return this.reflection.name;
        }
    }
}