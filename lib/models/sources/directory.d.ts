import { Reflection } from "../reflections/abstract";
import { ReflectionGroup } from "../ReflectionGroup";
import { SourceFile } from "./file";
export declare class SourceDirectory {
    parent: SourceDirectory;
    directories: {
        [name: string]: SourceDirectory;
    };
    groups: ReflectionGroup[];
    files: SourceFile[];
    name: string;
    dirName: string;
    url: string;
    constructor(name?: string, parent?: SourceDirectory);
    toString(indent?: string): string;
    getAllReflections(): Reflection[];
}
