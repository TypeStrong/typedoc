import type { SourceFile } from "../sources/index";
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

/**
 * A reflection that represents the root of the project.
 *
 * The project reflection acts as a global index, one may receive all reflections
 * and source files of the processed project through this reflection.
 */
export class ProjectReflection extends ContainerReflection {
    // Used to resolve references.
    private symbolToReflectionIdMap = new Map<ts.Symbol, number>();

    private reflectionIdToSymbolMap = new Map<number, ts.Symbol>();

    // Maps a reflection ID to all references eventually referring to it.
    private referenceGraph?: Map<number, number[]>;

    /**
     * A list of all reflections within the project.
     * @deprecated use {@link getReflectionById}, this will eventually be removed.
     *   To iterate over all reflections, prefer {@link getReflectionsByKind}.
     */
    reflections: { [id: number]: Reflection } = {};

    /**
     * A list of all source files within the project.
     */
    files: SourceFile[] = [];

    /**
     * The name of the project.
     *
     * The name can be passed as a command line argument or it is read from the package info.
     * this.name is assigned in the Reflection class.
     */
    override name!: string;

    /**
     * The contents of the readme.md file of the project when found.
     */
    readme?: string;

    /**
     * The parsed data of the package.json file of the project when found.
     */
    packageInfo: any;

    constructor(name: string) {
        super(name, ReflectionKind.Project);
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
     * When excludeNotExported is set, if a symbol is exported only under a different name
     * there will be a reference which points to the symbol, but the symbol will not be converted
     * and the rename will point to nothing. Warn the user if this happens.
     */
    removeDanglingReferences() {
        const dangling = new Set<ReferenceReflection>();
        for (const ref of Object.values(this.reflections)) {
            if (ref instanceof ReferenceReflection) {
                if (!ref.tryGetTargetReflection()) {
                    dangling.add(ref);
                }
            }
        }
        for (const refl of dangling) {
            this.removeReflection(refl);
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
            this.symbolToReflectionIdMap.set(
                symbol,
                this.symbolToReflectionIdMap.get(symbol) ?? reflection.id
            );
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
        if (
            symbol &&
            this.symbolToReflectionIdMap.get(symbol) === reflection.id
        ) {
            this.symbolToReflectionIdMap.delete(symbol);
        }

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
        const id = this.symbolToReflectionIdMap.get(symbol);
        if (typeof id === "number") {
            return this.getReflectionById(id);
        }
    }

    /** @internal */
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
}
