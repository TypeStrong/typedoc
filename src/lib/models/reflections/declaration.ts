import type * as ts from "typescript";
import { ReferenceType, ReflectionType, Type, type SomeType } from "../types";
import { type TraverseCallback, TraverseProperty } from "./abstract";
import { ContainerReflection } from "./container";
import type { SignatureReflection } from "./signature";
import type { TypeParameterReflection } from "./type-parameter";
import type { Serializer, JSONOutput, Deserializer } from "../../serialization";
import { Comment, CommentDisplayPart } from "../comments";
import { SourceReference } from "../sources/file";
import { ReflectionSymbolId } from "./ReflectionSymbolId";
import { ReflectionKind } from "./kind";

/**
 * Stores hierarchical type data.
 *
 * @see {@link DeclarationReflection.typeHierarchy}
 */
export interface DeclarationHierarchy {
    /**
     * The types represented by this node in the hierarchy.
     */
    types: Type[];

    /**
     * The next hierarchy level.
     */
    next?: DeclarationHierarchy;

    /**
     * Is this the entry containing the target type?
     */
    isTarget?: boolean;
}

/**
 * @internal
 */
export enum ConversionFlags {
    None = 0,
    VariableSource = 1,
}

/**
 * A reflection that represents a single declaration emitted by the TypeScript compiler.
 *
 * All parts of a project are represented by DeclarationReflection instances. The actual
 * kind of a reflection is stored in its ´kind´ member.
 */
export class DeclarationReflection extends ContainerReflection {
    readonly variant = "declaration" as "declaration" | "reference";

    /**
     * A list of all source files that contributed to this reflection.
     */
    sources?: SourceReference[];

    /**
     * A precomputed boost derived from the searchCategoryBoosts and searchGroupBoosts options, used when
     * boosting search relevance scores at runtime. May be modified by plugins.
     */
    relevanceBoost?: number;

    /**
     * The escaped name of this declaration assigned by the TS compiler if there is an associated symbol.
     * This is used to retrieve properties for analyzing inherited members.
     *
     * Not serialized, only useful during conversion.
     * @internal
     */
    escapedName?: ts.__String;

    /**
     * The type of the reflection.
     *
     * If the reflection represents a variable or a property, this is the value type.<br />
     * If the reflection represents a signature, this is the return type.
     */
    type?: SomeType;

    typeParameters?: TypeParameterReflection[];

    /**
     * A list of call signatures attached to this declaration.
     *
     * TypeDoc creates one declaration per function that may contain one or more
     * signature reflections.
     */
    signatures?: SignatureReflection[];

    /**
     * The index signature of this declaration.
     */
    indexSignature?: SignatureReflection;

    /**
     * The get signature of this declaration.
     */
    getSignature?: SignatureReflection;

    /**
     * The set signature of this declaration.
     */
    setSignature?: SignatureReflection;

    /**
     * The default value of this reflection.
     *
     * Applies to function parameters, variables, and properties.
     */
    defaultValue?: string;

    /**
     * A type that points to the reflection that has been overwritten by this reflection.
     *
     * Applies to interface and class members.
     */
    overwrites?: ReferenceType;

    /**
     * A type that points to the reflection this reflection has been inherited from.
     *
     * Applies to interface and class members.
     */
    inheritedFrom?: ReferenceType;

    /**
     * A type that points to the reflection this reflection is the implementation of.
     *
     * Applies to class members.
     */
    implementationOf?: ReferenceType;

    /**
     * A list of all types this reflection extends (e.g. the parent classes).
     */
    extendedTypes?: SomeType[];

    /**
     * A list of all types that extend this reflection (e.g. the subclasses).
     */
    extendedBy?: ReferenceType[];

    /**
     * A list of all types this reflection implements.
     */
    implementedTypes?: SomeType[];

    /**
     * A list of all types that implement this reflection.
     */
    implementedBy?: ReferenceType[];

    /**
     * Contains a simplified representation of the type hierarchy suitable for being
     * rendered in templates.
     */
    typeHierarchy?: DeclarationHierarchy;

    /**
     * The contents of the readme file of the module when found.
     */
    readme?: CommentDisplayPart[];

    /**
     * The version of the module when found.
     */
    version?: string;

    /**
     * Flags for information about a reflection which is needed solely during conversion.
     * @internal
     */
    conversionFlags = ConversionFlags.None;

    override isDeclaration(): this is DeclarationReflection {
        return true;
    }

    override hasGetterOrSetter(): boolean {
        return !!this.getSignature || !!this.setSignature;
    }

    getAllSignatures(): SignatureReflection[] {
        let result: SignatureReflection[] = [];

        if (this.signatures) {
            result = result.concat(this.signatures);
        }
        if (this.indexSignature) {
            result.push(this.indexSignature);
        }
        if (this.getSignature) {
            result.push(this.getSignature);
        }
        if (this.setSignature) {
            result.push(this.setSignature);
        }

        return result;
    }

    /** @internal */
    getNonIndexSignatures(): SignatureReflection[] {
        return ([] as SignatureReflection[]).concat(
            this.signatures ?? [],
            this.setSignature ?? [],
            this.getSignature ?? []
        );
    }

    /**
     * Traverse all potential child reflections of this reflection.
     *
     * The given callback will be invoked for all children, signatures and type parameters
     * attached to this reflection.
     *
     * @param callback  The callback function that should be applied for each child reflection.
     */
    override traverse(callback: TraverseCallback) {
        for (const parameter of this.typeParameters?.slice() || []) {
            if (callback(parameter, TraverseProperty.TypeParameter) === false) {
                return;
            }
        }

        if (this.type instanceof ReflectionType) {
            if (
                callback(
                    this.type.declaration,
                    TraverseProperty.TypeLiteral
                ) === false
            ) {
                return;
            }
        }

        for (const signature of this.signatures?.slice() || []) {
            if (callback(signature, TraverseProperty.Signatures) === false) {
                return;
            }
        }

        if (this.indexSignature) {
            if (
                callback(
                    this.indexSignature,
                    TraverseProperty.IndexSignature
                ) === false
            ) {
                return;
            }
        }

        if (this.getSignature) {
            if (
                callback(this.getSignature, TraverseProperty.GetSignature) ===
                false
            ) {
                return;
            }
        }

        if (this.setSignature) {
            if (
                callback(this.setSignature, TraverseProperty.SetSignature) ===
                false
            ) {
                return;
            }
        }

        super.traverse(callback);
    }

    /**
     * Return a string representation of this reflection.
     */
    override toString(): string {
        let result = super.toString();

        if (this.typeParameters) {
            const parameters: string[] = this.typeParameters.map(
                (parameter) => parameter.name
            );
            result += "<" + parameters.join(", ") + ">";
        }

        if (this.type) {
            result += ":" + this.type.toString();
        }

        return result;
    }

    override toObject(
        serializer: Serializer
    ): JSONOutput.DeclarationReflection {
        return {
            ...super.toObject(serializer),
            variant: this.variant,
            sources: serializer.toObjectsOptional(this.sources),
            relevanceBoost:
                this.relevanceBoost === 1 ? undefined : this.relevanceBoost,
            typeParameters: serializer.toObjectsOptional(this.typeParameters),
            type: serializer.toObject(this.type),
            signatures: serializer.toObjectsOptional(this.signatures),
            indexSignature: serializer.toObject(this.indexSignature),
            getSignature: serializer.toObject(this.getSignature),
            setSignature: serializer.toObject(this.setSignature),
            defaultValue: this.defaultValue,
            overwrites: serializer.toObject(this.overwrites),
            inheritedFrom: serializer.toObject(this.inheritedFrom),
            implementationOf: serializer.toObject(this.implementationOf),
            extendedTypes: serializer.toObjectsOptional(this.extendedTypes),
            extendedBy: serializer.toObjectsOptional(this.extendedBy),
            implementedTypes: serializer.toObjectsOptional(
                this.implementedTypes
            ),
            implementedBy: serializer.toObjectsOptional(this.implementedBy),
        };
    }

    override fromObject(
        de: Deserializer,
        obj: JSONOutput.DeclarationReflection | JSONOutput.ProjectReflection
    ): void {
        super.fromObject(de, obj);

        // This happens when merging multiple projects together.
        // If updating this, also check ProjectReflection.fromObject.
        if (obj.variant === "project") {
            this.kind = ReflectionKind.Module;
            if (obj.readme) {
                this.readme = Comment.deserializeDisplayParts(de, obj.readme);
            }

            de.defer(() => {
                for (const [id, sid] of Object.entries(obj.symbolIdMap || {})) {
                    const refl = this.project.getReflectionById(
                        de.oldIdToNewId[+id] ?? -1
                    );
                    if (refl) {
                        this.project.registerSymbolId(
                            refl,
                            new ReflectionSymbolId(sid)
                        );
                    } else {
                        de.logger.warn(
                            `Serialized project contained a reflection with id ${id} but it was not present in deserialized project.`
                        );
                    }
                }
            });
            return;
        }

        this.sources = de.reviveMany(
            obj.sources,
            (src) => new SourceReference(src.fileName, src.line, src.character)
        );
        this.relevanceBoost = obj.relevanceBoost;

        this.typeParameters = de.reviveMany(obj.typeParameters, (tp) =>
            de.constructReflection(tp)
        );
        this.type = de.revive(obj.type, (t) => de.constructType(t));
        this.signatures = de.reviveMany(obj.signatures, (r) =>
            de.constructReflection(r)
        );
        this.indexSignature = de.revive(obj.indexSignature, (r) =>
            de.constructReflection(r)
        );
        this.getSignature = de.revive(obj.getSignature, (r) =>
            de.constructReflection(r)
        );
        this.setSignature = de.revive(obj.setSignature, (r) =>
            de.constructReflection(r)
        );
        this.defaultValue = obj.defaultValue;
        this.overwrites = de.reviveType(obj.overwrites);
        this.inheritedFrom = de.reviveType(obj.inheritedFrom);
        this.implementationOf = de.reviveType(obj.implementationOf);
        this.extendedTypes = de.reviveMany(obj.extendedTypes, (t) =>
            de.reviveType(t)
        );
        this.extendedBy = de.reviveMany(obj.extendedBy, (t) =>
            de.reviveType(t)
        );
        this.implementedTypes = de.reviveMany(obj.implementedTypes, (t) =>
            de.reviveType(t)
        );
        this.implementedBy = de.reviveMany(obj.implementedBy, (t) =>
            de.reviveType(t)
        );
    }
}
