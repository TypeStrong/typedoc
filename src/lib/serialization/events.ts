import { Event } from '../utils/events';
import { ProjectReflection } from '../models';

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

    output: any;

    constructor(name: string, project: ProjectReflection) {
        super(name);
        this.project = project;
    }
}
