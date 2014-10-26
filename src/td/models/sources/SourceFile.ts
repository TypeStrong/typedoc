module td.models
{
    /**
     * Exposes information about a source file.
     *
     * One my access a list of all source files through the [[ProjectReflection.files]] property or as
     * a tree structure through the [[ProjectReflection.directory]] property.
     *
     * Furthermore each reflection carries references to the related SourceFile with their
     * [[DeclarationReflection.sources]] property. It is an array of of [[IDeclarationSource]] instances
     * containing the reference in their [[IDeclarationSource.file]] field.
     */
    export class SourceFile
    {
        /**
         * The original full system file name.
         */
        fullFileName:string;

        /**
         * A trimmed version of the file name. Contains only the path relative to the
         * determined base path.
         */
        fileName:string;

        /**
         * The base name of the file.
         */
        name:string;

        /**
         * A url pointing to a page displaying the contents of this file.
         */
        url:string;

        /**
         * The representation of the parent directory of this source file.
         */
        parent:SourceDirectory;

        /**
         * A list of all reflections that are declared in this file.
         */
        reflections:DeclarationReflection[] = [];

        /**
         * A grouped list of the reflections declared in this file.
         */
        groups:ReflectionGroup[];


        /**
         * Create a new SourceFile instance.
         *
         * @param fullFileName  The full file name.
         */
        constructor(fullFileName:string) {
            this.fileName     = fullFileName;
            this.fullFileName = fullFileName;
            this.name         = Path.basename(fullFileName);
        }
    }
}