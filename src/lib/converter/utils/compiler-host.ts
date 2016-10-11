import * as ts from "typescript";
import * as Path from "path";

import {ConverterComponent} from "../components";


/**
 * Return code of ts.sys.readFile when the file encoding is unsupported.
 */
const ERROR_UNSUPPORTED_FILE_ENCODING = -2147024809;


/**
 * CompilerHost implementation
 */
export class CompilerHost extends ConverterComponent implements ts.CompilerHost
{

    /**
     * The full path of the current directory. Result cache of [[getCurrentDirectory]].
     */
    private currentDirectory:string;



    /**
     * Return an instance of ts.SourceFile representing the given file.
     *
     * Implementation of ts.CompilerHost.getSourceFile()
     *
     * @param filename  The path and name of the file that should be loaded.
     * @param languageVersion  The script target the file should be interpreted with.
     * @param onError  A callback that will be invoked if an error occurs.
     * @returns An instance of ts.SourceFile representing the given file.
     */
    getSourceFile(filename:string, languageVersion:ts.ScriptTarget, onError?: (message: string) => void):ts.SourceFile {
        try {
            var text = ts.sys.readFile(filename, this.application.options.getCompilerOptions().charset);
        } catch (e) {
            if (onError) {
                onError(e.number === ERROR_UNSUPPORTED_FILE_ENCODING ? 'Unsupported file encoding' : e.message);
            }
            text = "";
        }

        return text !== undefined ? ts.createSourceFile(filename, text, languageVersion) : undefined;
    }


    /**
     * Return the full path of the default library that should be used.
     *
     * Implementation of ts.CompilerHost.getDefaultLibFilename()
     *
     * @returns The full path of the default library.
     */
    getDefaultLibFileName(options:ts.CompilerOptions):string {
        var lib = this.owner.getDefaultLib();
        var path = ts.getDirectoryPath(ts.normalizePath(require.resolve('typescript')));
        return Path.join(path, lib);
    }

    getDirectories(path: string): string[] {
        return ts.sys.getDirectories(path);
    }


    /**
     * Return the full path of the current directory.
     *
     * Implementation of ts.CompilerHost.getCurrentDirectory()
     *
     * @returns The full path of the current directory.
     */
    getCurrentDirectory():string {
        return this.currentDirectory || (this.currentDirectory = ts.sys.getCurrentDirectory());
    }


    /**
     * Return whether file names are case sensitive on the current platform or not.
     *
     * Implementation of ts.CompilerHost.useCaseSensitiveFileNames()
     *
     * @returns TRUE if file names are case sensitive on the current platform, FALSE otherwise.
     */
    useCaseSensitiveFileNames():boolean {
        return ts.sys.useCaseSensitiveFileNames;
    }


    /**
     * Check whether the given file exists.
     *
     * Implementation of ts.CompilerHost.fileExists(fileName)
     *
     * @param fileName
     * @returns {boolean}
     */
    fileExists(fileName:string):boolean {
        return ts.sys.fileExists(fileName);
    }


    /**
     * Return the contents of the given file.
     *
     * Implementation of ts.CompilerHost.readFile(fileName)
     *
     * @param fileName
     * @returns {string}
     */
    readFile(fileName:string):string {
        return ts.sys.readFile(fileName);
    }


    /**
     * Return the canonical file name of the given file.
     *
     * Implementation of ts.CompilerHost.getCanonicalFileName()
     *
     * @param fileName  The file name whose canonical variant should be resolved.
     * @returns The canonical file name of the given file.
     */
    getCanonicalFileName(fileName:string):string {
        return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
    }


    /**
     * Return the new line char sequence of the current platform.
     *
     * Implementation of ts.CompilerHost.getNewLine()
     *
     * @returns The new line char sequence of the current platform.
     */
    getNewLine():string {
        return ts.sys.newLine;
    }


    /**
     * Write a compiled javascript file to disc.
     *
     * As TypeDoc will not emit compiled javascript files this is a null operation.
     *
     * Implementation of ts.CompilerHost.writeFile()
     *
     * @param fileName  The name of the file that should be written.
     * @param data  The contents of the file.
     * @param writeByteOrderMark  Whether the UTF-8 BOM should be written or not.
     * @param onError  A callback that will be invoked if an error occurs.
     */
    writeFile(fileName:string, data:string, writeByteOrderMark:boolean, onError?:(message: string) => void) { }
}
