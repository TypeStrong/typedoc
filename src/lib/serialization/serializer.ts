import { EventDispatcher } from "../utils";
import type { ProjectReflection } from "../models";

import { SerializeEvent } from "./events";
import type { ModelToObject } from "./schema";
import type { SerializerComponent } from "./components";
import { insertPrioritySorted } from "../utils/array";

export interface SerializerEvents {
    begin: [SerializeEvent];
    end: [SerializeEvent];
}

export class Serializer extends EventDispatcher<SerializerEvents> {
    /**
     * Triggered when the {@link Serializer} begins transforming a project.
     * @event
     */
    static readonly EVENT_BEGIN = "begin";

    /**
     * Triggered when the {@link Serializer} has finished transforming a project.
     * @event
     */
    static readonly EVENT_END = "end";

    private serializers: SerializerComponent<any>[] = [];

    /**
     * Only set when serializing.
     */
    projectRoot!: string;

    addSerializer<T extends {}>(serializer: SerializerComponent<T>): void {
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

        const eventBegin = new SerializeEvent(value);
        this.trigger(Serializer.EVENT_BEGIN, eventBegin);

        const project = this.toObject(value);

        const eventEnd = new SerializeEvent(value, project);
        this.trigger(Serializer.EVENT_END, eventEnd);

        return project;
    }
}
