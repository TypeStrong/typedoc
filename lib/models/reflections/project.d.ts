import { SourceFile, SourceDirectory } from "../sources/index";
import { Reflection, ReflectionKind } from "./abstract";
import { ContainerReflection } from "./container";
export declare class ProjectReflection extends ContainerReflection {
    reflections: {
        [id: number]: Reflection;
    };
    symbolMapping: {
        [symbolId: number]: number;
    };
    directory: SourceDirectory;
    files: SourceFile[];
    name: string;
    readme: string;
    packageInfo: any;
    constructor(name: string);
    isProject(): boolean;
    getReflectionsByKind(kind: ReflectionKind): Reflection[];
    findReflectionByName(name: string): Reflection;
    findReflectionByName(names: string[]): Reflection;
}
