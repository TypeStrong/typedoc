import { EventDispatcher } from "../utils";
import type { ProjectReflection } from "../models";

import { SerializeEvent, SerializeEventData } from "./events";
import type { ModelToObject } from "./schema";
import type { SerializerComponent } from "./components";

export class Serializer extends EventDispatcher {
    /**
     * Triggered when the {@link Serializer} begins transforming a project.
     * @event EVENT_BEGIN
     */
    static EVENT_BEGIN = "begin";

    /**
     * Triggered when the {@link Serializer} has finished transforming a project.
     * @event EVENT_END
     */
    static EVENT_END = "end";

    private serializers: SerializerComponent<any>[] = [];

    addSerializer(serializer: SerializerComponent<any>): void {
        this.serializers.push(serializer);
        this.serializers.sort((a, b) => b.priority - a.priority);
    }

    toObject<T extends { toObject(serializer: Serializer): ModelToObject<T> }>(
        value: T
    ): ModelToObject<T> {
        return this.serializers
            .filter((s) => s.serializeGroup(value) && s.supports(value))
            .reduce(
                (val, s) => s.toObject(value, val, this) as ModelToObject<T>,
                value.toObject(this)
            );
    }

    /**
     * Same as toObject but emits {@link Serializer.EVENT_BEGIN} and {@link Serializer.EVENT_END} events.
     * @param value
     * @param eventData Partial information to set in the event
     */
    projectToObject(
        value: ProjectReflection,
        eventData: { begin?: SerializeEventData; end?: SerializeEventData } = {}
    ): ModelToObject<ProjectReflection> {
        const eventBegin = new SerializeEvent(Serializer.EVENT_BEGIN, value);
        if (eventData.begin) {
            eventBegin.outputDirectory = eventData.begin.outputDirectory;
            eventBegin.outputFile = eventData.begin.outputFile;
        }
        this.trigger(eventBegin);

        const project = this.toObject(value);

        const eventEnd = new SerializeEvent(
            Serializer.EVENT_END,
            value,
            project
        );
        if (eventData.end) {
            eventBegin.outputDirectory = eventData.end.outputDirectory;
            eventBegin.outputFile = eventData.end.outputFile;
        }
        this.trigger(eventEnd);

        return project;
    }
}
