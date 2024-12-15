import { EventDispatcher } from "../utils/index.js";
import type { ProjectReflection } from "../models/index.js";

import { SerializeEvent } from "./events.js";
import type { ModelToObject } from "./schema.js";
import type { SerializerComponent } from "./components.js";
import { insertPrioritySorted, removeIfPresent } from "../utils/array.js";

export interface SerializerEvents {
    begin: [SerializeEvent];
    end: [SerializeEvent];
}

/**
 * Serializes TypeDoc's models to JSON
 *
 * @group Common
 * @summary Serializes TypeDoc's models to JSON
 */
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

    /**
     * Only set when serializing
     */
    project!: ProjectReflection;

    addSerializer<T extends object>(serializer: SerializerComponent<T>): void {
        insertPrioritySorted(this.serializers, serializer);
    }

    removeSerializer(serializer: SerializerComponent<any>): void {
        removeIfPresent(this.serializers, serializer);
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
        this.project = value;

        const eventBegin = new SerializeEvent(value);
        this.trigger(Serializer.EVENT_BEGIN, eventBegin);

        const project = this.toObject(value);

        const eventEnd = new SerializeEvent(value, project);
        this.trigger(Serializer.EVENT_END, eventEnd);

        this.project = undefined!;
        this.projectRoot = undefined!;

        return project;
    }
}
