import { DeclarationReflection } from "./declaration";
import { ReflectionKind } from "./kind";
import type { Serializer, JSONOutput, Deserializer } from "../../serialization";
import type { Reflection } from "./abstract";

/**
 * Describes a reflection which does not exist at this location, but is referenced. Used for imported reflections.
 *
 * ```ts
 * // a.ts
 * export const a = 1;
 * // b.ts
 * import { a } from './a';
 * // Here to avoid extra work we create a reference to the original reflection in module a instead
 * // of copying the reflection.
 * export { a };
 * ```
 * @category Reflections
 */
export class ReferenceReflection extends DeclarationReflection {
    override readonly variant = "reference";

    private _target: number;

    /**
     * Creates a reference reflection. Should only be used within the factory function.
     * @internal
     */
    constructor(name: string, reflection: Reflection, parent?: Reflection) {
        super(name, ReflectionKind.Reference, parent);
        this._target = reflection.id;
    }

    /**
     * Tries to get the reflection that is referenced. This may be another reference reflection.
     * To fully resolve any references, use {@link tryGetTargetReflectionDeep}.
     */
    tryGetTargetReflection(): Reflection | undefined {
        return this.project.getReflectionById(this._target);
    }

    /**
     * Tries to get the reflection that is referenced, this will fully resolve references.
     * To only resolve one reference, use {@link tryGetTargetReflection}.
     */
    tryGetTargetReflectionDeep(): Reflection | undefined {
        let result = this.tryGetTargetReflection();
        while (result instanceof ReferenceReflection) {
            result = result.tryGetTargetReflection();
        }
        return result;
    }

    /**
     * Gets the reflection that is referenced. This may be another reference reflection.
     * To fully resolve any references, use {@link getTargetReflectionDeep}.
     */
    getTargetReflection(): Reflection {
        const target = this.tryGetTargetReflection();
        if (!target) {
            throw new Error("Reference was unresolved.");
        }
        return target;
    }

    /**
     * Gets the reflection that is referenced, this will fully resolve references.
     * To only resolve one reference, use {@link getTargetReflection}.
     */
    getTargetReflectionDeep(): Reflection {
        let result = this.getTargetReflection();
        while (result instanceof ReferenceReflection) {
            result = result.getTargetReflection();
        }
        return result;
    }

    override getChildByName(arg: string | string[]): Reflection | undefined {
        return this.getTargetReflection().getChildByName(arg);
    }

    override toObject(serializer: Serializer): JSONOutput.ReferenceReflection {
        return {
            ...super.toObject(serializer),
            variant: this.variant,
            target: this.tryGetTargetReflection()?.id ?? -1,
        };
    }

    override fromObject(
        de: Deserializer,
        obj: JSONOutput.ReferenceReflection,
    ): void {
        super.fromObject(de, obj);
        de.defer((project) => {
            this._target =
                project.getReflectionById(de.oldIdToNewId[obj.target] ?? -1)
                    ?.id ?? -1;
        });
    }
}
