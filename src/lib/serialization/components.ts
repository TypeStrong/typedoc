import { Reflection, Type } from "../models";

import { Serializer } from "./serializer";
import { ModelToObject } from "./schema";

let nextSerializerId = 0;

/**
 * Represents Serializer plugin component.
 *
 * Like [[Converter]] plugins each [[Serializer]] plugin defines a predicate that instructs if an
 * object can be serialized by it, this is done dynamically at runtime via a `supports` method.
 *
 * Additionally, each [[Serializer]] plugin must define a predicate that instructs the group
 * it belongs to.
 *
 * Serializers are grouped to improve performance when finding serializers that apply to a node,
 * this makes it possible to skip the `supports` calls for `Type`s when searching for a
 * `Reflection` and vise versa.
 */
export abstract class SerializerComponent<T> {
    /**
     * The priority this serializer should be executed with.
     * A higher priority means the [[Serializer]] will be applied earlier.
     */
    static PRIORITY = 0;

    // When this serializer has a hand in serializing something, this ID is placed
    // into the serialized output.  This helps us deserialize, because we know which
    // serializers to call.
    id: string;

    constructor(owner: Serializer) {
        this.owner = owner;
        this.id = `${nextSerializerId++}`;
    }

    /**
     * Set when the SerializerComponent is added to the serializer.
     */
    protected owner: Serializer;

    /**
     * A high-level predicate filtering which group this serializer belongs to.
     * This is a high-level filter before the [[SerializerComponent.supports]] predicate filter.
     *
     * For example, use the [[Reflection]] class class to group all reflection based serializers:
     * ```typescript
     * class ReflectionSerializer {
     *  serializeGroup(instance) { return instance instanceof Reflection }
     * }
     * ```
     *
     * Use the [[Type]] class to group all type based serializers:
     * ```typescript
     * class TypeSerializer {
     *  serializeGroup(instance) { return instance instanceof Type }
     * }
     * ```
     */
    abstract serializeGroup(instance: unknown): boolean;

    /**
     * The priority this serializer should be executed with.
     * A higher priority means the [[Serializer]] will be applied earlier.
     */
    get priority(): number {
        return (
            (this.constructor as typeof SerializerComponent)["PRIORITY"] ||
            SerializerComponent.PRIORITY
        );
    }

    abstract supports(item: unknown): boolean;

    abstract toObject(item: T, obj?: object): Partial<ModelToObject<T>>;

    fromObject(_item: T, _obj: Partial<ModelToObject<T>>): void {
        // no-op
    }

    /**
     * For any given Reflection, at least one serializer should implement
     * this method.
     * Otherwise an error will be thrown.
     */
    createFromObject(_obj: ModelToObject<T>): T | undefined {
        return undefined;
    }
}

export abstract class ReflectionSerializerComponent<
    T extends Reflection
> extends SerializerComponent<T> {
    /**
     * Filter for instances of [[Reflection]]
     */
    serializeGroup(instance: unknown): boolean {
        return instance instanceof Reflection;
    }
}

export abstract class TypeSerializerComponent<
    T extends Type
> extends SerializerComponent<T> {
    /**
     * Filter for instances of [[Type]]
     */
    serializeGroup(instance: unknown): boolean {
        return instance instanceof Type;
    }
}
