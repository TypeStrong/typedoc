import { Event } from "../utils/events";
import type { ProjectReflection } from "../models";
import type { ProjectReflection as JSONProjectReflection } from "./schema";

/**
 * An event emitted by the {@link Serializer} class at the very beginning and
 * ending of the a project serialization process.
 *
 * @see {@link Serializer.EVENT_BEGIN}
 * @see {@link Serializer.EVENT_END}
 */
export class SerializeEvent extends Event {
    /**
     * The project the renderer is currently processing.
     */
    readonly project: ProjectReflection;

    output: JSONProjectReflection | undefined;

    constructor(
        name: string,
        project: ProjectReflection,
        output?: JSONProjectReflection,
    ) {
        super(name);
        this.project = project;
        this.output = output;
    }
}
