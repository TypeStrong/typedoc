module td.converter
{
    /**
     * Helper class that determines the common base path of a set of files.
     *
     * In the first step all files must be passed to [[add]]. Afterwards [[trim]]
     * can be used to retrieve the shortest path relative to the determined base path.
     */
    export class BasePath
    {
        /**
         * List of known base paths.
         */
        private basePaths:string[] = [];


        /**
         * Add the given file path to this set of base paths.
         *
         * @param fileName  The absolute filename that should be added to the base path.
         */
        add(fileName:string) {
            var fileDir  = Path.dirname(BasePath.normalize(fileName));
            var filePath = fileDir.split('/');

            basePaths: for (var n = 0, c = this.basePaths.length; n < c; n++) {
                var basePath = this.basePaths[n].split('/');
                var mMax     = Math.min(basePath.length, filePath.length);
                for (var m = 0; m < mMax; m++) {
                    if (basePath[m] == filePath[m]) {
                        continue;
                    }

                    if (m < 1) {
                        // No match at all, try next known base path
                        continue basePaths;
                    } else {
                        // Partial match, trim the known base path
                        if (m < basePath.length) {
                            this.basePaths[n] = basePath.slice(0, m).join('/');
                        }
                        return;
                    }
                }

                // Complete match, exit
                this.basePaths[n] = basePath.splice(0, mMax).join('/');
                return;
            }

            // Unknown base path, add it
            this.basePaths.push(fileDir);
        }


        /**
         * Trim the given filename by the determined base paths.
         *
         * @param fileName  The absolute filename that should be trimmed.
         * @returns The trimmed version of the filename.
         */
        trim(fileName:string):string {
            fileName = BasePath.normalize(fileName);
            for (var n = 0, c = this.basePaths.length; n < c; n++) {
                var basePath = this.basePaths[n];
                if (fileName.substr(0, basePath.length) == basePath) {
                    return fileName.substr(basePath.length + 1);
                }
            }

            return fileName;
        }


        /**
         * Reset this instance, ignore all paths already passed to [[add]].
         */
        reset() {
            this.basePaths = [];
        }


        /**
         * Normalize the given path.
         *
         * @param path  The path that should be normalized.
         * @returns Normalized version of the given path.
         */
        static normalize(path:string):string {
            // Ensure forward slashes
            path = path.replace(/\\/g, '/');

            // Remove all surrounding quotes
            path = path.replace(/^["']+|["']+$/g, '');

            // Make Windows drive letters lower case
            return path.replace(/^([^\:]+)\:\//, (m, m1) => m1.toUpperCase() + ':/');
        }
    }
}