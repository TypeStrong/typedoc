import { EventDispatcher } from "../utils/index.js";
import type { ProjectReflection } from "../models/index.js";

import { SerializeEvent } from "./events.js";
import type { ModelToObject } from "./schema.js";
import type { SerializerComponent } from "./components.js";
import { insertPrioritySorted } from "../utils/array.js";

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

    /**
     * Only set when serializing.
     */
    projectRoot!: string;

    addSerializer(serializer: SerializerComponent<any>): void {
        insertPrioritySorted(this.serializers, serializer);
    }

    toObject<T extends { toObject(serializer: Serializer): ModelToObject<T> }>(
        value: T,
    ): ModelToObject<T>;
    toObject<T extends { toObject(serializer: Serializer): ModelToObject<T> }>(
        value: T | undefined,
    ): ModelToObject<T> | undefined;
    toObject(
        value: { toObject(serializer: Serializer): any } | undefined,
    ): unknown {
        if (value === undefined) {
            return undefined;
        }

        return this.serializers
            .filter((s) => s.supports(value))
            .reduce(
                (val, s) => s.toObject(value, val, this),
                value.toObject(this),
            );
    }

    toObjectsOptional<
        T extends { toObject(serializer: Serializer): ModelToObject<T> },
    >(value: T[] | undefined): ModelToObject<T>[] | undefined {
        if (!value || value.length === 0) {
            return undefined;
        }

        return value.map((val) => this.toObject(val));
    }

    /**
     * Same as toObject but emits {@link Serializer.EVENT_BEGIN} and {@link Serializer.EVENT_END} events.
     * @param value
     */
    projectToObject(
        value: ProjectReflection,
        projectRoot: string,
    ): ModelToObject<ProjectReflection> {
        this.projectRoot = projectRoot;

        const eventBegin = new SerializeEvent(Serializer.EVENT_BEGIN, value);
        this.trigger(eventBegin);

        const project = this.toObject(value);

        const eventEnd = new SerializeEvent(
            Serializer.EVENT_END,
            value,
            project,
        );
        this.trigger(eventEnd);

        return project;
    }
}
