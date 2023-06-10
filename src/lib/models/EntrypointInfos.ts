import { DocumentationEntryPoint, normalizePath } from "../utils";
import type { JSONOutput } from "../serialization";
import { isAbsolute, relative } from "path";

export class EntrypointInfos {
    readmeFile?: string;
    rootDir: string;
    packageJsonFile?: string;
    entrySourceFilePath?: string;

    constructor(rootDir: string, entrySourceFilePath?: string) {
        this.rootDir = rootDir;
        this.entrySourceFilePath = entrySourceFilePath;
    }

    static fromDocumentationEntrypoint(
        docEntryPoint: DocumentationEntryPoint
    ): EntrypointInfos {
        const entrypointInfos = new EntrypointInfos(
            toRelative(docEntryPoint.rootDir),
            toRelative(docEntryPoint.sourceFile.fileName)
        );
        if (docEntryPoint.readmeFile) {
            entrypointInfos.readmeFile = toRelative(docEntryPoint.readmeFile);
        }
        if (docEntryPoint.packageJsonFile) {
            entrypointInfos.packageJsonFile = toRelative(
                docEntryPoint.packageJsonFile
            );
        }
        return entrypointInfos;
    }

    clone(): EntrypointInfos {
        const entrypointInfos = new EntrypointInfos(
            this.rootDir,
            this.entrySourceFilePath
        );
        if (this.readmeFile) {
            entrypointInfos.readmeFile = this.readmeFile;
        }
        if (this.packageJsonFile) {
            entrypointInfos.packageJsonFile = this.packageJsonFile;
        }
        return entrypointInfos;
    }

    toObject(): JSONOutput.EntrypointInfos {
        return {
            readmeFile: this.readmeFile,
            rootDir: this.rootDir,
            packageJsonFile: this.packageJsonFile,
            entrySourceFilePath: this.entrySourceFilePath,
        };
    }

    static fromObject(obj?: JSONOutput.EntrypointInfos) {
        if (!obj) {
            return undefined;
        }
        const entrypointInfos = new EntrypointInfos(
            obj.rootDir,
            obj.entrySourceFilePath
        );
        entrypointInfos.fromObject(obj);
        return entrypointInfos;
    }

    fromObject(obj: JSONOutput.EntrypointInfos) {
        if (obj.readmeFile) {
            this.readmeFile = obj.readmeFile;
        }
        if (obj.packageJsonFile) {
            this.packageJsonFile = obj.packageJsonFile;
        }
    }
}

const toRelative = <T extends string | undefined>(path: T): T => {
    if (path) {
        return normalizePath(
            isAbsolute(path) ? relative(process.cwd(), path) : path
        ) as T;
    }
    return path;
};
