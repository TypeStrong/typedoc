import type { Serializer } from "./serializer";
import type { ModelToObject } from "./schema";

/**
 * Represents Serializer plugin component.
 *
 * Like {@link Converter} plugins each {@link Serializer} plugin defines a predicate that instructs if an
 * object can be serialized by it. This is done dynamically at runtime via a `supports` method.
 *
 * Additionally, each {@link Serializer} plugin must define a predicate that instructs the group
 * it belongs to.
 */
export interface SerializerComponent<T> {
    /**
     * The priority this serializer should be executed with.
     * A higher priority means the {@link Serializer} will be applied earlier.
     */
    readonly priority: number;

    supports(item: unknown): item is T;

    toObject(
        item: T,
        obj: Partial<ModelToObject<T>>,
        serializer: Serializer
    ): Partial<ModelToObject<T>>;
}
