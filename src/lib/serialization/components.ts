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
export abstract class SerializerComponent<T> {
    /**
     * The priority this serializer should be executed with.
     * A higher priority means the {@link Serializer} will be applied earlier.
     */
    static PRIORITY = 0;

    /**
     * The priority this serializer should be executed with.
     * A higher priority means the {@link Serializer} will be applied earlier.
     */
    get priority(): number {
        return (
            (this.constructor as typeof SerializerComponent)["PRIORITY"] ||
            SerializerComponent.PRIORITY
        );
    }

    /**
     * Legacy additional check for the `supports` method.
     *
     * @deprecated Use `supports` below instead.
     */
    serializeGroup(_instance: unknown): boolean {
        return true;
    }

    abstract supports(item: unknown): boolean;

    abstract toObject(
        item: T,
        obj: Partial<ModelToObject<T>>,
        serializer: Serializer
    ): Partial<ModelToObject<T>>;
}
