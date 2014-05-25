module TypeDoc.Models
{
    export class ProjectReflection extends BaseReflection
    {
        reflections:DeclarationReflection[] = [];

        directory:SourceDirectory = new SourceDirectory();

        files:SourceFile[] = [];

        name:string;

        readme:string;

        package:any;


        /**
         * Return a list of all reflections in this project of a certain kind.
         *
         * @param kind  The desired kind of reflection.
         * @returns     An array containing all reflections with the desired kind.
         */
        getReflectionsByKind(kind:TypeScript.PullElementKind):DeclarationReflection[] {
            var values = [];
            this.reflections.forEach((reflection) => {
                if (reflection.kindOf(kind)) {
                    values.push(reflection);
                }
            });
            return values;
        }
    }
}