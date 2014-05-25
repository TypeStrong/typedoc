module TypeDoc.Models
{
    /**
     * A reflection that represents the root of the project.
     *
     * The project reflection acts as a global index, one may receive all reflections
     * and source files of the processed project through this reflection.
     */
    export class ProjectReflection extends BaseReflection
    {
        /**
         * A list of all reflections within the project.
         */
        reflections:DeclarationReflection[] = [];

        /**
         * The root directory of the project.
         */
        directory:SourceDirectory = new SourceDirectory();

        /**
         * A list of all source files within the project.
         */
        files:SourceFile[] = [];

        /**
         * The name of the project.
         *
         * The name can be passed as a commandline argument or it is read from the package info.
         */
        name:string;

        /**
         * The contents of the readme.md file of the project when found.
         */
        readme:string;

        /**
         * The parsed data of the package.json file of the project when found.
         */
        packageInfo:any;



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