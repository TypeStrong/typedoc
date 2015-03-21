module td.models
{
    /**
     * Exposes information about a directory containing source files.
     *
     * One my access the root directory of a project through the [[ProjectReflection.directory]]
     * property. Traverse through directories by utilizing the [[SourceDirectory.parent]] or
     * [[SourceDirectory.directories]] properties.
     */
    export class SourceDirectory
    {
        /**
         * The parent directory or NULL if this is a root directory.
         */
        parent:SourceDirectory = null;

        /**
         * A list of all subdirectories.
         */
        directories:{[name:string]:SourceDirectory} = {};

        /**
         * A list of all files in this directory.
         */
        files:SourceFile[] = [];

        /**
         * The name of this directory.
         */
        name:string = null;

        /**
         * The relative path from the root directory to this directory.
         */
        dirName:string = null;

        /**
         * The url of the page displaying the directory contents.
         */
        url:string;


        /**
         * Create a new SourceDirectory instance.
         *
         * @param name  The new of directory.
         * @param parent  The parent directory instance.
         */
        constructor(name?:string, parent?:SourceDirectory) {
            if (name && parent) {
                this.name    = name;
                this.dirName = (parent.dirName ? parent.dirName + '/' : '') + name;
                this.parent  = parent;
            }
        }


        /**
         * Return a string describing this directory and its contents.
         *
         * @param indent  Used internally for indention.
         * @returns A string representing this directory and all of its children.
         */
        toString(indent:string = '') {
            var res = indent + this.name;

            for (var key in this.directories) {
                if (!this.directories.hasOwnProperty(key)) continue;
                res += '\n' + this.directories[key].toString(indent + '  ');
            }

            this.files.forEach((file) => {
                res += '\n' + indent + '  ' + file.fileName;
            });

            return res;
        }


        /**
         * Return a list of all reflections exposed by the files within this directory.
         *
         * @returns An aggregated list of all [[DeclarationReflection]] defined in the
         * files of this directory.
         */
        getAllReflections():DeclarationReflection[] {
            var reflections = [];
            this.files.forEach((file) => {
                reflections.push.apply(reflections, file.reflections);
            });

            // reflections.sort(Factories.GroupHandler.sortCallback);
            return reflections;
        }
    }
}