module TypeDoc.Factories
{
    export class BasePath
    {
        basePath:string;


        add(fileName:string) {
            var dirname = BasePath.normalize(Path.dirname(fileName));
            if (this.basePath) {
                var len = this.basePath.length;
                while (len > dirname.length || this.basePath != dirname.substr(0, len)) {
                    var basePath = BasePath.normalize(Path.resolve(Path.join(this.basePath, '..')));
                    if (this.basePath == basePath) break;
                    this.basePath = basePath;
                    len = this.basePath.length;
                }
            } else {
                this.basePath = dirname;
            }
        }


        trim(fileName:string) {
            return fileName.substr(this.basePath.length + 1);
        }


        static normalize(path:string):string {
            path = path.replace(/\\/g, '/');
            path = path.replace(/^["']+|["']+$/g, '');
            path = path.replace(/^([^\:]+)\:\//, (m, m1) => m1.toUpperCase() + ':/');
            return path;
        }
    }
}