module TypeDoc.Models
{
    export class SourceDirectory
    {
        name:string = null;

        dirName:string = null;

        url:string;

        parent:SourceDirectory = null;

        directories:{[name:string]:SourceDirectory} = {};

        files:SourceFile[] = [];

        groups:ReflectionGroup[];


        constructor(name?:string, parent?:SourceDirectory) {
            if (name && parent) {
                this.name    = name;
                this.dirName = (parent.dirName ? parent.dirName + '/' : '') + name;
                this.parent  = parent;
            }
        }


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


        getAllReflections():DeclarationReflection[] {
            var reflections = [];
            this.files.forEach((file) => {
                reflections.push.apply(reflections, file.reflections);
            });

            reflections.sort(Factories.GroupHandler.sortCallback);
            return reflections;
        }
    }
}