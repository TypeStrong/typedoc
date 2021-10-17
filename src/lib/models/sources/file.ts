import * as Path from "path";

import type { ReflectionGroup } from "../ReflectionGroup";
import type { SourceDirectory } from "./directory";
import type { RepositoryType } from "./repository";
import type { DeclarationReflection } from "..";

/**
 * Represents references of reflections to their defining source files.
 *
 * @see {@link DeclarationReflection.sources}
 */
export interface SourceReference {
    /**
     * A reference to the corresponding file instance.
     */
    file?: SourceFile;

    /**
     * The filename of the source file.
     */
    fileName: string;

    /**
     * The number of the line that emitted the declaration.
     */
    line: number;

    character: number;

    /**
     * URL for displaying the source file.
     */
    url?: string;
}

/**
 * Exposes information about a source file.
 *
 * One may access a list of all source files through the {@link ProjectReflection.files} property or as
 * a tree structure through the {@link ProjectReflection.directory} property.
 *
 * Furthermore each reflection carries references to the related SourceFile with their
 * {@link DeclarationReflection.sources} property. It is an array of of {@link SourceReference} instances
 * containing the reference in their {@link SourceReference.file} field.
 */
export class SourceFile {
    /**
     * The original full system file name.
     */
    fullFileName: string;

    /**
     * A trimmed version of the file name. Contains only the path relative to the
     * determined base path.
     */
    fileName: string;

    /**
     * The base name of the file.
     */
    name: string;

    /**
     * A URL pointing to a page displaying the contents of this file.
     */
    url?: string;

    /**
     * The type of repository where this file is hosted.
     */
    repositoryType?: RepositoryType;

    /**
     * The representation of the parent directory of this source file.
     */
    parent?: SourceDirectory;

    /**
     * A list of all reflections that are declared in this file.
     */
    reflections: DeclarationReflection[] = [];

    /**
     * A grouped list of the reflections declared in this file.
     */
    groups?: ReflectionGroup[];

    /**
     * Create a new SourceFile instance.
     *
     * @param fullFileName  The full file name.
     */
    constructor(fullFileName: string) {
        this.fileName = fullFileName;
        this.fullFileName = fullFileName;
        this.name = Path.basename(fullFileName);
    }
}
