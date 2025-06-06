import { type ReferenceType, ReflectionType, type SomeType } from "./types.js";
import { type ReflectionId, type TraverseCallback, TraverseProperty } from "./Reflection.js";
import { ContainerReflection } from "./ContainerReflection.js";
import type { SignatureReflection } from "./SignatureReflection.js";
import type { TypeParameterReflection } from "./TypeParameterReflection.js";
import type { Deserializer, JSONOutput, Serializer } from "#serialization";
import { Comment, type CommentDisplayPart } from "./Comment.js";
import { SourceReference } from "./SourceReference.js";
import { ReflectionSymbolId } from "./ReflectionSymbolId.js";
import { ReflectionKind } from "./kind.js";
import { i18n } from "#utils";

/**
 * Stores hierarchical type data.
 *
 * @see {@link DeclarationReflection.typeHierarchy}
 */
export interface DeclarationHierarchy {
    /**
     * The types represented by this node in the hierarchy.
     */
    types: SomeType[];

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
 * A reflection that represents a single declaration emitted by the TypeScript compiler.
 *
 * All parts of a project are represented by DeclarationReflection instances. The actual
 * kind of a reflection is stored in its `kind` member.
 * @category Reflections
 */
export class DeclarationReflection extends ContainerReflection {
    readonly variant = "declaration" as "declaration" | "reference";

    /**
     * A list of all source files that contributed to this reflection.
     */
    sources?: SourceReference[];

    /**
     * The escaped name of this declaration assigned by the TS compiler if there is an associated symbol.
     * This is used to retrieve properties for analyzing inherited members.
     *
     * Not serialized, only useful during conversion. This is a `ts.__String`.
     * @internal
     */
    escapedName?: string;

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
    indexSignatures?: SignatureReflection[];

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
    packageVersion?: string;

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
        if (this.indexSignatures) {
            result = result.concat(this.indexSignatures);
        }
        if (this.getSignature) {
            result.push(this.getSignature);
        }
        if (this.setSignature) {
            result.push(this.setSignature);
        }

        return result;
    }

    getNonIndexSignatures(): SignatureReflection[] {
        return ([] as SignatureReflection[]).concat(
            this.signatures ?? [],
            this.setSignature ?? [],
            this.getSignature ?? [],
        );
    }

    getProperties(): DeclarationReflection[] {
        if (this.children?.length) {
            return this.children;
        }

        if (this.type?.type === "reflection") {
            return this.type.declaration.children ?? [];
        }
        return [];
    }

    getChildOrTypePropertyByName(
        path: string[],
    ): DeclarationReflection | undefined {
        if (this.type?.type === "reflection") {
            for (const child of this.type.declaration.children || []) {
                if (path[0] === child.name) {
                    if (path.length === 1) {
                        return child;
                    }
                    return child.getChildOrTypePropertyByName(path.slice(1));
                }
            }
        }

        for (const child of this.children || []) {
            if (path[0] === child.name) {
                if (path.length === 1) {
                    return child;
                }
                return child.getChildOrTypePropertyByName(path.slice(1));
            }
        }

        return undefined;
    }

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
                    TraverseProperty.TypeLiteral,
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

        for (const signature of this.indexSignatures?.slice() || []) {
            if (
                callback(signature, TraverseProperty.IndexSignature) === false
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
                (parameter) => parameter.name,
            );
            result += "<" + parameters.join(", ") + ">";
        }

        if (this.type) {
            result += ": " + this.type.toString();
        }

        return result;
    }

    override toObject(
        serializer: Serializer,
    ): JSONOutput.DeclarationReflection {
        return {
            ...super.toObject(serializer),
            variant: this.variant,
            packageVersion: this.packageVersion,
            sources: serializer.toObjectsOptional(this.sources),
            typeParameters: serializer.toObjectsOptional(this.typeParameters),
            type: serializer.toObject(this.type),
            signatures: serializer.toObjectsOptional(this.signatures),
            indexSignatures: serializer.toObjectsOptional(this.indexSignatures),
            getSignature: serializer.toObject(this.getSignature),
            setSignature: serializer.toObject(this.setSignature),
            defaultValue: this.defaultValue,
            overwrites: serializer.toObject(this.overwrites),
            inheritedFrom: serializer.toObject(this.inheritedFrom),
            implementationOf: serializer.toObject(this.implementationOf),
            extendedTypes: serializer.toObjectsOptional(this.extendedTypes),
            extendedBy: serializer.toObjectsOptional(this.extendedBy),
            implementedTypes: serializer.toObjectsOptional(
                this.implementedTypes,
            ),
            implementedBy: serializer.toObjectsOptional(this.implementedBy),
            readme: Comment.serializeDisplayParts(this.readme),
        };
    }

    override fromObject(
        de: Deserializer,
        obj: JSONOutput.DeclarationReflection | JSONOutput.ProjectReflection,
    ): void {
        super.fromObject(de, obj);

        if (obj.readme) {
            this.readme = Comment.deserializeDisplayParts(de, obj.readme);
        }

        // This happens when merging multiple projects together.
        // If updating this, also check ProjectReflection.fromObject.
        if (obj.variant === "project") {
            this.kind = ReflectionKind.Module;
            this.packageVersion = obj.packageVersion;
            this.project.files.fromObject(de, obj.files || {});

            de.defer(() => {
                for (const [id, sid] of Object.entries(obj.symbolIdMap || {})) {
                    const refl = this.project.getReflectionById(
                        de.oldIdToNewId[+id as ReflectionId] ?? -1,
                    );
                    if (refl) {
                        this.project.registerSymbolId(
                            refl,
                            new ReflectionSymbolId(sid),
                        );
                    } else {
                        de.logger.warn(
                            i18n.serialized_project_referenced_0_not_part_of_project(
                                id.toString(),
                            ),
                        );
                    }
                }
            });
            return;
        }

        this.packageVersion = obj.packageVersion;
        this.sources = de.reviveMany(
            obj.sources,
            (src) => new SourceReference(src.fileName, src.line, src.character),
        );

        this.typeParameters = de.reviveMany(obj.typeParameters, (tp) => de.constructReflection(tp));
        this.type = de.revive(obj.type, (t) => de.constructType(t));
        this.signatures = de.reviveMany(obj.signatures, (r) => de.constructReflection(r));

        this.indexSignatures = de.reviveMany(obj.indexSignatures, (r) => de.constructReflection(r));
        this.getSignature = de.revive(obj.getSignature, (r) => de.constructReflection(r));
        this.setSignature = de.revive(obj.setSignature, (r) => de.constructReflection(r));
        this.defaultValue = obj.defaultValue;
        this.overwrites = de.reviveType(obj.overwrites);
        this.inheritedFrom = de.reviveType(obj.inheritedFrom);
        this.implementationOf = de.reviveType(obj.implementationOf);
        this.extendedTypes = de.reviveMany(obj.extendedTypes, (t) => de.reviveType(t));
        this.extendedBy = de.reviveMany(obj.extendedBy, (t) => de.reviveType(t));
        this.implementedTypes = de.reviveMany(obj.implementedTypes, (t) => de.reviveType(t));
        this.implementedBy = de.reviveMany(obj.implementedBy, (t) => de.reviveType(t));
    }
}
