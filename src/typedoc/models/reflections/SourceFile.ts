module TypeDoc.Models
{
    export class SourceFile
    {
        name:string;

        fileName:string;

        url:string;

        parent:SourceDirectory;

        reflections:DeclarationReflection[] = [];

        groups:ReflectionGroup[];


        constructor(fileName:string) {
            this.fileName = fileName;
            this.name = Path.basename(fileName);
        }
    }
}