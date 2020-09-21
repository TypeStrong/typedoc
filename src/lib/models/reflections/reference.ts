import { Reflection, ReflectionKind, ReflectionFlag } from "./abstract";
import { ProjectReflection } from "./project";
import { DeclarationReflection } from "./declaration";

export enum ReferenceState {
    Unresolved,
    Resolved,
}

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
 */
export class ReferenceReflection extends DeclarationReflection {
    private _state:
        | [ReferenceState.Unresolved, string]
        | [ReferenceState.Resolved, number];
    private _project?: ProjectReflection;

    /**
     * Creates a reference reflection. Should only be used within the factory function.
     * @param name
     * @param state
     * @param parent
     *
     * @internal
     */
    constructor(
        name: string,
        state: ReferenceReflection["_state"],
        parent?: Reflection
    ) {
        super(name, ReflectionKind.Reference, parent);
        // References are only created for re-exported items, so they must be exported.
        this.flags.setFlag(ReflectionFlag.Exported, true);
        this._state = state;
    }

    /**
     * Helper to check if this reflection is a reference for themes.
     */
    get isReference() {
        return true;
    }

    /**
     * Tries to get the reflection that is referenced. This may be another reference reflection.
     * To fully resolve any references, use [[tryGetTargetReflectionDeep]].
     */
    tryGetTargetReflection(): Reflection | undefined {
        this._ensureProject();
        this._ensureResolved(false);
        return this._state[0] === ReferenceState.Resolved
            ? this._project!.getReflectionById(this._state[1])
            : undefined;
    }

    /**
     * Tries to get the reflection that is referenced, this will fully resolve references.
     * To only resolve one reference, use [[tryGetTargetReflection]].
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
     * To fully resolve any references, use [[getTargetReflectionDeep]].
     */
    getTargetReflection(): Reflection {
        this._ensureProject();
        this._ensureResolved(true);

        return this._project!.getReflectionById(this._state[1] as number)!;
    }

    /**
     * Gets the reflection that is referenced, this will fully resolve references.
     * To only resolve one reference, use [[getTargetReflection]].
     */
    getTargetReflectionDeep(): Reflection {
        let result = this.getTargetReflection();
        while (result instanceof ReferenceReflection) {
            result = result.getTargetReflection();
        }
        return result;
    }

    private _ensureResolved(throwIfFail: boolean) {
        if (this._state[0] === ReferenceState.Unresolved) {
            const target = this._project!.getReflectionFromFQN(this._state[1]);
            if (!target) {
                if (throwIfFail) {
                    throw new Error(
                        `Tried to reference reflection for ${this.name} that does not exist.`
                    );
                }
                return;
            }
            this._state = [ReferenceState.Resolved, target.id];
        }
    }

    private _ensureProject() {
        if (this._project) {
            return;
        }

        let project = this.parent;
        while (project && !project.isProject()) {
            project = project.parent;
        }
        this._project = project;

        if (!this._project) {
            throw new Error(
                "Reference reflection has no project and is unable to resolve."
            );
        }
    }
}
