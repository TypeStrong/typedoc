import { Reflection } from '../reflections/abstract';
import { ReflectionCategory } from '../ReflectionCategory';
import { ReflectionGroup } from '../ReflectionGroup';
import { SourceDirectory } from './directory';
export interface SourceReference {
    file?: SourceFile;
    fileName: string;
    line: number;
    character: number;
    url?: string;
}
export declare class SourceFile {
    fullFileName: string;
    fileName: string;
    name: string;
    url: string;
    parent: SourceDirectory;
    reflections: Reflection[];
    groups: ReflectionGroup[];
    categories: ReflectionCategory[];
    constructor(fullFileName: string);
}
