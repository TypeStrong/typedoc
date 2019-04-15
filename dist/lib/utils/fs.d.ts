export declare function normalizePath(path: string): string;
export declare function directoryExists(directoryPath: string): boolean;
export declare function ensureDirectoriesExist(directoryPath: string): void;
export declare function writeFile(fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void): void;
export declare function readFile(file: string): string;
