module TypeDoc.Factories
{
    export class BasePath
    {
        basePath:string;


        add(fileName:string) {
            var dirname = BasePath.normalize(Path.dirname(fileName));
            if (this.basePath) {
                var basePath = this.basePath;
                var len = basePath.length;

                while (basePath != dirname.substr(0, len)) {
                    if (len <= dirname.length) {
                        return;
                    }

                    var parentPath = BasePath.normalize(Path.resolve(Path.join(basePath, '..')));
                    if (basePath == parentPath) break;
                    basePath = parentPath;
                    len = basePath.length;
                }

                this.basePath = basePath;
            } else {
                this.basePath = dirname;
            }
        }


        trim(fileName:string) {
            return fileName.substr(this.basePath.length + 1);
        }


        reset() {
            this.basePath = null;
        }


        static normalize(path:string):string {
            path = path.replace(/\\/g, '/');
            path = path.replace(/^["']+|["']+$/g, '');
            path = path.replace(/^([^\:]+)\:\//, (m, m1) => m1.toUpperCase() + ':/');
            return path;
        }
    }
}