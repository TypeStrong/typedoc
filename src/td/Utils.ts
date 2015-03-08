module td
{
    /**
     * List of known existent directories. Used to speed up [[directoryExists]].
     */
    var existingDirectories:ts.Map<boolean> = {};


    /**
     * Normalize the given path.
     *
     * @param path  The path that should be normalized.
     * @returns The normalized path.
     */
    export function normalizePath(path:string) {
        return ts.normalizePath(path);
    }


    /**
     * Test whether the given directory exists.
     *
     * @param directoryPath  The directory that should be tested.
     * @returns TRUE if the given directory exists, FALSE otherwise.
     */
    export function directoryExists(directoryPath: string): boolean {
        if (ts.hasProperty(existingDirectories, directoryPath)) {
            return true;
        }

        if (ts.sys.directoryExists(directoryPath)) {
            existingDirectories[directoryPath] = true;
            return true;
        }

        return false;
    }


    /**
     * Make sure that the given directory exists.
     *
     * @param directoryPath  The directory that should be validated.
     */
    export function ensureDirectoriesExist(directoryPath: string) {
        if (directoryPath.length > ts.getRootLength(directoryPath) && !directoryExists(directoryPath)) {
            var parentDirectory = ts.getDirectoryPath(directoryPath);
            ensureDirectoriesExist(parentDirectory);
            ts.sys.createDirectory(directoryPath);
        }
    }


    /**
     * Write a file to disc.
     *
     * If the containing directory does not exist it will be created.
     *
     * @param fileName  The name of the file that should be written.
     * @param data  The contents of the file.
     * @param writeByteOrderMark  Whether the UTF-8 BOM should be written or not.
     * @param onError  A callback that will be invoked if an error occurs.
     */
    export function writeFile(fileName:string, data:string, writeByteOrderMark:boolean, onError?:(message:string) => void) {
        try {
            ensureDirectoriesExist(ts.getDirectoryPath(ts.normalizePath(fileName)));
            ts.sys.writeFile(fileName, data, writeByteOrderMark);
        } catch (e) {
            if (onError) onError(e.message);
        }
    }
}