import { Event } from '../utils/events';
import { ProjectReflection } from '../models';
export declare class SerializeEvent extends Event {
    project: ProjectReflection;
    outputDirectory?: string;
    outputFile?: string;
    output: any;
}
