import { type Reflection, TraverseProperty } from "./abstract";
import { ContainerReflection } from "./container";
import { ReferenceReflection } from "./reference";
import type { DeclarationReflection } from "./declaration";
import type { SignatureReflection } from "./signature";
import type { ParameterReflection } from "./parameter";
import { IntrinsicType } from "../types";
import type { TypeParameterReflection } from "./type-parameter";
import { assertNever, removeIf, removeIfPresent } from "../../utils";
import type * as ts from "typescript";
import { ReflectionKind } from "./kind";
import { Comment, type CommentDisplayPart } from "../comments";
import { ReflectionSymbolId } from "./ReflectionSymbolId";
import type { Serializer } from "../../serialization/serializer";
import type { Deserializer, JSONOutput } from "../../serialization/index";
import { DefaultMap, StableKeyMap } from "../../utils/map";
import type { DocumentReflection } from "./document";
import type { FileRegistry } from "../FileRegistry";

/**
 * A reflection that represents the root of the project.
 *
 * The project reflection acts as a global index, one may receive all reflections
 * and source files of the processed project through this reflection.
 * @category Reflections
 */
export class ProjectReflection extends ContainerReflection {
    readonly variant = "project";

    // Used to resolve references.
    private symbolToReflectionIdMap: Map<
        ReflectionSymbolId,
        number | number[]
    > = new StableKeyMap();

    private reflectionIdToSymbolIdMap = new Map<number, ReflectionSymbolId>();

    private reflectionIdToSymbolMap = new Map<number, ts.Symbol>();

    // Maps a reflection ID to all references eventually referring to it.
    private referenceGraph?: Map<number, number[]>;
    // Maps a reflection ID to all reflections with it as their parent.
    private reflectionChildren = new DefaultMap<number, number[]>(() => []);

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

    /**
     * Object which describes where to find content for relative links.
     */
    readonly files: FileRegistry;

    constructor(name: string, registry: FileRegistry) {
        super(name, ReflectionKind.Project);
        this.reflections[this.id] = this;
        this.files = registry;
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
            reflection.kindOf(kind),
        );
    }

    /**
     * Registers the given reflection so that it can be quickly looked up by helper methods.
     * Should be called for *every* reflection added to the project.
     */
    registerReflection(
        reflection: Reflection,
        symbol: ts.Symbol | undefined,
        filePath: string | undefined,
    ) {
        this.referenceGraph = undefined;
        if (reflection.parent) {
            this.reflectionChildren
                .get(reflection.parent.id)
                .push(reflection.id);
        }
        this.reflections[reflection.id] = reflection;

        if (symbol) {
            this.reflectionIdToSymbolMap.set(reflection.id, symbol);
            const id = new ReflectionSymbolId(symbol);
            this.registerSymbolId(reflection, id);

            // #2466
            // If we just registered a member of a class or interface, then we need to check if
            // we've registered this symbol before under the wrong parent reflection.
            // This can happen because the compiler API will use non-dependently-typed symbols
            // for properties of classes/interfaces which inherit them, so we can't rely on the
            // property being unique for each class.
            if (
                reflection.parent?.kindOf(ReflectionKind.ClassOrInterface) &&
                reflection.kindOf(ReflectionKind.SomeMember)
            ) {
                const saved = this.symbolToReflectionIdMap.get(id);
                const parentSymbolReflection =
                    symbol.parent &&
                    this.getReflectionFromSymbol(symbol.parent);

                if (
                    typeof saved === "object" &&
                    saved.length > 1 &&
                    parentSymbolReflection
                ) {
                    removeIf(
                        saved,
                        (item) =>
                            this.getReflectionById(item)?.parent !==
                            parentSymbolReflection,
                    );
                }
            }
        }

        if (filePath) {
            this.files.registerReflection(filePath, reflection);
        }
    }

    /**
     * Removes a reflection from the documentation. Can be used by plugins to filter reflections
     * out of the generated documentation. Has no effect if the reflection is not present in the
     * project.
     */
    removeReflection(reflection: Reflection) {
        // Remove the reflection...
        this._removeReflection(reflection);

        // And now try to remove references to it in the parent reflection.
        // This might not find anything if someone called removeReflection on a member of a union
        // but I think that could only be caused by a plugin doing something weird, not by a regular
        // user... so this is probably good enough for now. Reflections that live on types are
        // kind of half-real anyways.
        const parent = reflection.parent as DeclarationReflection | undefined;
        parent?.traverse((child, property) => {
            if (child !== reflection) {
                return true; // Continue iteration
            }

            switch (property) {
                case TraverseProperty.Children:
                case TraverseProperty.Documents:
                    parent.removeChild(
                        reflection as
                            | DeclarationReflection
                            | DocumentReflection,
                    );
                    break;
                case TraverseProperty.GetSignature:
                    delete parent.getSignature;
                    break;
                case TraverseProperty.IndexSignature:
                    removeIfPresent(
                        parent.indexSignatures,
                        reflection as SignatureReflection,
                    );
                    if (!parent.indexSignatures?.length) {
                        delete parent.indexSignatures;
                    }
                    break;
                case TraverseProperty.Parameters:
                    removeIfPresent(
                        (reflection.parent as SignatureReflection).parameters,
                        reflection as ParameterReflection,
                    );
                    if (
                        !(reflection.parent as SignatureReflection).parameters
                            ?.length
                    ) {
                        delete (reflection.parent as SignatureReflection)
                            .parameters;
                    }
                    break;
                case TraverseProperty.SetSignature:
                    delete parent.setSignature;
                    break;
                case TraverseProperty.Signatures:
                    removeIfPresent(
                        parent.signatures,
                        reflection as SignatureReflection,
                    );
                    if (!parent.signatures?.length) {
                        delete parent.signatures;
                    }
                    break;
                case TraverseProperty.TypeLiteral:
                    parent.type = new IntrinsicType("Object");
                    break;
                case TraverseProperty.TypeParameter:
                    removeIfPresent(
                        parent.typeParameters,
                        reflection as TypeParameterReflection,
                    );
                    if (!parent.typeParameters?.length) {
                        delete parent.typeParameters;
                    }
                    break;
                default:
                    assertNever(property);
            }

            return false; // Stop iteration
        });
    }

    /**
     * Remove a reflection without updating the parent reflection to remove references to the removed reflection.
     */
    private _removeReflection(reflection: Reflection) {
        this.files.removeReflection(reflection);

        // Remove references pointing to this reflection
        const graph = this.getReferenceGraph();
        for (const id of graph.get(reflection.id) ?? []) {
            const ref = this.getReflectionById(id);
            if (ref) {
                this.removeReflection(ref);
            }
        }
        graph.delete(reflection.id);

        // Remove children of this reflection
        for (const childId of this.reflectionChildren.getNoInsert(
            reflection.id,
        ) || []) {
            const child = this.getReflectionById(childId);
            // Only remove if the child's parent is still actually this reflection.
            // This might not be the case if a plugin has moved this reflection to another parent.
            // (typedoc-plugin-merge-modules)
            if (child?.parent === reflection) {
                this._removeReflection(child);
            }
        }
        this.reflectionChildren.delete(reflection.id);

        // Remove references from the TS symbol to this reflection.
        const symbolId = this.reflectionIdToSymbolIdMap.get(reflection.id);
        if (symbolId) {
            const saved = this.symbolToReflectionIdMap.get(symbolId);
            if (saved === reflection.id) {
                this.symbolToReflectionIdMap.delete(symbolId);
            } else if (typeof saved === "object") {
                removeIfPresent(saved, reflection.id);
            }
        }

        this.reflectionIdToSymbolMap.delete(reflection.id);
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
     * If there are multiple reflections associated with this symbol, gets the first one.
     * @internal
     */
    getReflectionFromSymbolId(
        symbolId: ReflectionSymbolId,
    ): Reflection | undefined {
        return this.getReflectionsFromSymbolId(symbolId)[0];
    }

    /** @internal */
    getReflectionsFromSymbolId(symbolId: ReflectionSymbolId) {
        const id = this.symbolToReflectionIdMap.get(symbolId);
        if (typeof id === "number") {
            return [this.getReflectionById(id)!];
        } else if (typeof id === "object") {
            return id.map((id) => this.getReflectionById(id)!);
        }

        return [];
    }

    /** @internal */
    getSymbolIdFromReflection(reflection: Reflection) {
        return this.reflectionIdToSymbolIdMap.get(reflection.id);
    }

    /** @internal */
    registerSymbolId(reflection: Reflection, id: ReflectionSymbolId) {
        this.reflectionIdToSymbolIdMap.set(reflection.id, id);

        const previous = this.symbolToReflectionIdMap.get(id);
        if (previous) {
            if (typeof previous === "number") {
                this.symbolToReflectionIdMap.set(id, [previous, reflection.id]);
            } else {
                previous.push(reflection.id);
            }
        } else {
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
            for (const id in this.reflections) {
                const ref = this.reflections[id];
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
            files: serializer.toObject(this.files),
        };
    }

    override fromObject(
        de: Deserializer,
        obj: JSONOutput.ProjectReflection,
    ): void {
        super.fromObject(de, obj);
        // If updating this, also check the block in DeclarationReflection.fromObject.
        this.packageName = obj.packageName;
        this.packageVersion = obj.packageVersion;
        if (obj.readme) {
            this.readme = Comment.deserializeDisplayParts(de, obj.readme);
        }
        this.files.fromObject(de, obj.files || {});

        de.defer(() => {
            // Unnecessary conditional in release
            for (const [id, sid] of Object.entries(obj.symbolIdMap || {})) {
                const refl = this.getReflectionById(de.oldIdToNewId[+id] ?? -1);
                if (refl) {
                    this.registerSymbolId(refl, new ReflectionSymbolId(sid));
                } else {
                    de.logger.warn(
                        de.application.i18n.serialized_project_referenced_0_not_part_of_project(
                            id.toString(),
                        ),
                    );
                }
            }
        });
    }
}
