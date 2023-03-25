import { Reflection, TraverseProperty } from "./abstract";
import { ContainerReflection } from "./container";
import { ReferenceReflection } from "./reference";
import type { DeclarationReflection } from "./declaration";
import type { SignatureReflection } from "./signature";
import type { ParameterReflection } from "./parameter";
import { IntrinsicType } from "../types";
import type { TypeParameterReflection } from "./type-parameter";
import { removeIfPresent } from "../../utils";
import type * as ts from "typescript";
import { ReflectionKind } from "./kind";
import { Comment, CommentDisplayPart } from "../comments";
import { ReflectionSymbolId } from "./ReflectionSymbolId";
import type { Serializer } from "../../serialization/serializer";
import type { Deserializer, JSONOutput } from "../../serialization/index";
import { StableKeyMap } from "../../utils/map";

/**
 * A reflection that represents the root of the project.
 *
 * The project reflection acts as a global index, one may receive all reflections
 * and source files of the processed project through this reflection.
 */
export class ProjectReflection extends ContainerReflection {
    readonly variant = "project";

    // Used to resolve references.
    private symbolToReflectionIdMap: Map<ReflectionSymbolId, number> =
        new StableKeyMap();

    private reflectionIdToSymbolIdMap = new Map<number, ReflectionSymbolId>();

    private reflectionIdToSymbolMap = new Map<number, ts.Symbol>();

    // Maps a reflection ID to all references eventually referring to it.
    private referenceGraph?: Map<number, number[]>;

    /**
     * A list of all reflections within the project. DO NOT MUTATE THIS OBJECT.
     * All mutation should be done via {@link registerReflection} and {@link removeReflection}
     * to ensure that links to reflections remain valid.
     *
     * This may be replaced with a `Map<number, Reflection>` someday.
     */
    reflections: { [id: number]: Reflection } = {};

    /**
     * The name of the package that this reflection documents according to package.json.
     */
    packageName?: string;

    /**
     * The version of the package that this reflection documents according to package.json.
     */
    packageVersion?: string;

    /**
     * The contents of the readme.md file of the project when found.
     */
    readme?: CommentDisplayPart[];

    constructor(name: string) {
        super(name, ReflectionKind.Project);
        this.reflections[this.id] = this;
    }

    /**
     * Return whether this reflection is the root / project reflection.
     */
    override isProject(): this is ProjectReflection {
        return true;
    }

    /**
     * Return a list of all reflections in this project of a certain kind.
     *
     * @param kind  The desired kind of reflection.
     * @returns     An array containing all reflections with the desired kind.
     */
    getReflectionsByKind(kind: ReflectionKind): Reflection[] {
        return Object.values(this.reflections).filter((reflection) =>
            reflection.kindOf(kind)
        );
    }

    /**
     * Disassociate this project with all TypeScript created objects, allowing the underlying
     * `ts.Program` to be garbage collected. This is very important for monorepo projects where
     * we need to create multiple programs. See #1606 and surrounding discussion.
     */
    forgetTsReferences() {
        // Clear ts.Symbol references
        this.reflectionIdToSymbolMap.clear();

        // TODO: I think we need to do something like this.
        // Update local references
        this.symbolToReflectionIdMap.clear();
        for (const [k, v] of this.reflectionIdToSymbolIdMap) {
            v.pos = Infinity;
            this.symbolToReflectionIdMap.set(v, k);
        }
    }

    /**
     * Registers the given reflection so that it can be quickly looked up by helper methods.
     * Should be called for *every* reflection added to the project.
     */
    registerReflection(reflection: Reflection, symbol?: ts.Symbol) {
        this.referenceGraph = undefined;
        this.reflections[reflection.id] = reflection;

        if (symbol) {
            const id = new ReflectionSymbolId(symbol);
            this.symbolToReflectionIdMap.set(
                id,
                this.symbolToReflectionIdMap.get(id) ?? reflection.id
            );
            this.reflectionIdToSymbolIdMap.set(reflection.id, id);
            this.reflectionIdToSymbolMap.set(reflection.id, symbol);
        }
    }

    /**
     * Removes a reflection from the documentation. Can be used by plugins to filter reflections
     * out of the generated documentation. Has no effect if the reflection is not present in the
     * project.
     */
    removeReflection(reflection: Reflection) {
        // Remove references
        for (const id of this.getReferenceGraph().get(reflection.id) ?? []) {
            const ref = this.getReflectionById(id);
            if (ref) {
                this.removeReflection(ref);
            }
        }
        this.getReferenceGraph().delete(reflection.id);

        reflection.traverse((child) => (this.removeReflection(child), true));

        const parent = reflection.parent as DeclarationReflection;
        parent?.traverse((child, property) => {
            if (child !== reflection) {
                return true; // Continue iteration
            }

            if (property === TraverseProperty.Children) {
                removeIfPresent(
                    parent.children,
                    reflection as DeclarationReflection
                );
            } else if (property === TraverseProperty.GetSignature) {
                delete parent.getSignature;
            } else if (property === TraverseProperty.IndexSignature) {
                delete parent.indexSignature;
            } else if (property === TraverseProperty.Parameters) {
                removeIfPresent(
                    (reflection.parent as SignatureReflection).parameters,
                    reflection as ParameterReflection
                );
            } else if (property === TraverseProperty.SetSignature) {
                delete parent.setSignature;
            } else if (property === TraverseProperty.Signatures) {
                removeIfPresent(
                    parent.signatures,
                    reflection as SignatureReflection
                );
            } else if (property === TraverseProperty.TypeLiteral) {
                parent.type = new IntrinsicType("Object");
            } else if (property === TraverseProperty.TypeParameter) {
                removeIfPresent(
                    parent.typeParameters,
                    reflection as TypeParameterReflection
                );
            }

            return false; // Stop iteration
        });

        const symbol = this.reflectionIdToSymbolMap.get(reflection.id);
        if (symbol) {
            const id = new ReflectionSymbolId(symbol);
            if (this.symbolToReflectionIdMap.get(id) === reflection.id) {
                this.symbolToReflectionIdMap.delete(id);
            }
        }

        this.reflectionIdToSymbolIdMap.delete(reflection.id);
        delete this.reflections[reflection.id];
    }

    /**
     * Gets the reflection registered for the given reflection ID, or undefined if it is not present
     * in the project.
     */
    getReflectionById(id: number): Reflection | undefined {
        return this.reflections[id];
    }

    /**
     * Gets the reflection associated with the given symbol, if it exists.
     * @internal
     */
    getReflectionFromSymbol(symbol: ts.Symbol) {
        return this.getReflectionFromSymbolId(new ReflectionSymbolId(symbol));
    }

    /**
     * Gets the reflection associated with the given symbol id, if it exists.
     * @internal
     */
    getReflectionFromSymbolId(symbolId: ReflectionSymbolId) {
        const id = this.symbolToReflectionIdMap.get(symbolId);
        if (typeof id === "number") {
            return this.getReflectionById(id);
        }
    }

    /** @internal */
    getSymbolIdFromReflection(reflection: Reflection) {
        return this.reflectionIdToSymbolIdMap.get(reflection.id);
    }

    /** @internal */
    registerSymbolId(reflection: Reflection, id: ReflectionSymbolId) {
        this.reflectionIdToSymbolIdMap.set(reflection.id, id);
        if (!this.symbolToReflectionIdMap.has(id)) {
            this.symbolToReflectionIdMap.set(id, reflection.id);
        }
    }

    /**
     * THIS MAY NOT BE USED AFTER CONVERSION HAS FINISHED.
     * @internal
     */
    getSymbolFromReflection(reflection: Reflection) {
        return this.reflectionIdToSymbolMap.get(reflection.id);
    }

    private getReferenceGraph(): Map<number, number[]> {
        if (!this.referenceGraph) {
            this.referenceGraph = new Map();
            for (const ref of Object.values(this.reflections)) {
                if (ref instanceof ReferenceReflection) {
                    const target = ref.tryGetTargetReflection();
                    if (target) {
                        const refs = this.referenceGraph.get(target.id) ?? [];
                        refs.push(ref.id);
                        this.referenceGraph.set(target.id, refs);
                    }
                }
            }
        }

        return this.referenceGraph;
    }

    override toObject(serializer: Serializer): JSONOutput.ProjectReflection {
        const symbolIdMap: Record<number, JSONOutput.ReflectionSymbolId> = {};
        this.reflectionIdToSymbolIdMap.forEach((sid, id) => {
            symbolIdMap[id] = sid.toObject(serializer);
        });

        return {
            ...super.toObject(serializer),
            variant: this.variant,
            packageName: this.packageName,
            packageVersion: this.packageVersion,
            readme: Comment.serializeDisplayParts(serializer, this.readme),
            symbolIdMap,
        };
    }

    override fromObject(
        de: Deserializer,
        obj: JSONOutput.ProjectReflection
    ): void {
        super.fromObject(de, obj);
        // If updating this, also check the block in DeclarationReflection.fromObject.
        this.packageName = obj.packageName;
        this.packageVersion = obj.packageVersion;
        if (obj.readme) {
            this.readme = Comment.deserializeDisplayParts(de, obj.readme);
        }

        de.defer(() => {
            for (const [id, sid] of Object.entries(obj.symbolIdMap || {})) {
                const refl = this.getReflectionById(de.oldIdToNewId[+id] ?? -1);
                if (refl) {
                    this.registerSymbolId(refl, new ReflectionSymbolId(sid));
                } else {
                    de.logger.warn(
                        `Serialized project contained a reflection with id ${id} but it was not present in deserialized project.`
                    );
                }
            }
        });
    }
}
