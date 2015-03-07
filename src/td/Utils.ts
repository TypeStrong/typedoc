module td
{
    var existingDirectories:ts.Map<boolean> = {};

    export function normalizePath(path:string) {
        return ts.normalizePath(path);
    }


    export function writeFile(fileName:string, data:string, writeByteOrderMark:boolean, onError?:(message:string) => void) {
        function directoryExists(directoryPath: string): boolean {
            if (ts.hasProperty(existingDirectories, directoryPath)) {
                return true;
            }
            if (ts.sys.directoryExists(directoryPath)) {
                existingDirectories[directoryPath] = true;
                return true;
            }
            return false;
        }

        function ensureDirectoriesExist(directoryPath: string) {
            if (directoryPath.length > ts.getRootLength(directoryPath) && !directoryExists(directoryPath)) {
                var parentDirectory = ts.getDirectoryPath(directoryPath);
                ensureDirectoriesExist(parentDirectory);
                ts.sys.createDirectory(directoryPath);
            }
        }

        try {
            ensureDirectoriesExist(ts.getDirectoryPath(ts.normalizePath(fileName)));
        }
        catch (e) {
            if (onError) onError(e.message);
        }
    }
}