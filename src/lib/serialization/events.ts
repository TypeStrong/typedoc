import { Event } from '../utils/events';
import { ProjectReflection } from '../models';
import { JSONOutput } from './schema';

/**
 * Optional data associated with the [[SerializeEvent]].
 */
export interface SerializeEventData {
    outputDirectory?: string;
    outputFile?: string;
}

/**
 * An event emitted by the [[Serializer]] class at the very beginning and
 * ending of the a project serialization process.
 *
 * @see [[Serializer.EVENT_BEGIN]]
 * @see [[Serializer.EVENT_END]]
 */
export class SerializeEvent extends Event {
    /**
     * The project the renderer is currently processing.
     */
    readonly project: ProjectReflection;

    /**
     * The path of the directory the serialized JSON should be written to.
     */
    outputDirectory?: string;

    /**
     * The name of the main JSON file (base + ext)
     */
    outputFile?: string;

    output: Partial<JSONOutput.ProjectReflection>;

    constructor(name: string, project: ProjectReflection, output: Partial<JSONOutput.ProjectReflection>) {
        super(name);
        this.project = project;
        this.output = output;
    }
}
