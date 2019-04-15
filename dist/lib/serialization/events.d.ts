import { Event } from '../utils/events';
import { ProjectReflection } from '../models';
export declare class SerializeEvent extends Event {
    readonly project: ProjectReflection;
    outputDirectory?: string;
    outputFile?: string;
    output: any;
    constructor(name: string, project: ProjectReflection);
}
