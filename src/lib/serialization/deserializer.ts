import { ok } from "assert";
import type { Application } from "../application";
import {
    ArrayType,
    ConditionalType,
    DeclarationReflection,
    DocumentReflection,
    IndexedAccessType,
    InferredType,
    IntersectionType,
    IntrinsicType,
    LiteralType,
    MappedType,
    NamedTupleMember,
    OptionalType,
    ParameterReflection,
    PredicateType,
    ProjectReflection,
    QueryType,
    ReferenceReflection,
    ReferenceType,
    Reflection,
    ReflectionKind,
    ReflectionType,
    type ReflectionVariant,
    RestType,
    SignatureReflection,
    type SomeType,
    TemplateLiteralType,
    TupleType,
    type TypeKindMap,
    TypeOperatorType,
    TypeParameterReflection,
    UnionType,
    UnknownType,
} from "../models/index";
import { insertPrioritySorted } from "../utils/array";
import type { Logger } from "../utils/loggers";
import type { JSONOutput } from "./index";
import type { FileRegistry } from "../models/FileRegistry";

export interface DeserializerComponent {
    priority: number;
    supports(model: unknown, obj: unknown): boolean;
    fromObject(model: unknown, obj: unknown): void;
}

export interface Deserializable<T> {
    fromObject(d: Deserializer, o: T): void;
}

export class Deserializer {
    private deferred: Array<(project: ProjectReflection) => void> = [];
    private deserializers: DeserializerComponent[] = [];
    private activeReflection: Reflection[] = [];
    constructor(readonly application: Application) {}

    get logger(): Logger {
        return this.application.logger;
    }

    reflectionBuilders: {
        [K in keyof ReflectionVariant]: (
            parent: NonNullable<ReflectionVariant[K]["parent"]>,
            obj: JSONOutput.ModelToObject<ReflectionVariant[K]>,
        ) => ReflectionVariant[K];
    } = {
        declaration(parent, obj) {
            return new DeclarationReflection(obj.name, obj.kind, parent);
        },
        document(parent, obj) {
            return new DocumentReflection(obj.name, parent, [], {});
        },
        param(parent, obj) {
            return new ParameterReflection(obj.name, obj.kind, parent);
        },
        project() {
            throw new Error(
                "Not supported, use Deserializer.reviveProject(s) instead.",
            );
        },
        reference(parent, obj): ReferenceReflection {
            // Ugly, but we don't have a reference yet!
            return new ReferenceReflection(
                obj.name,
                /* target */ parent,
                parent,
            );
        },
        signature(parent, obj) {
            return new SignatureReflection(
                obj.name,
                obj.kind as SignatureReflection["kind"],
                parent,
            );
        },
        typeParam(parent, obj) {
            return new TypeParameterReflection(obj.name, parent, void 0);
        },
    };

    typeBuilders: {
        [K in keyof TypeKindMap]: (
            obj: JSONOutput.ModelToObject<TypeKindMap[K]>,
            de: Deserializer,
        ) => TypeKindMap[K];
    } = {
        array(obj, de) {
            return new ArrayType(de.reviveType(obj.elementType));
        },
        conditional(obj, de) {
            return new ConditionalType(
                de.reviveType(obj.checkType),
                de.reviveType(obj.extendsType),
                de.reviveType(obj.trueType),
                de.reviveType(obj.falseType),
            );
        },
        indexedAccess(obj, de) {
            return new IndexedAccessType(
                de.reviveType(obj.objectType),
                de.reviveType(obj.indexType),
            );
        },
        inferred(obj, de) {
            return new InferredType(obj.name, de.reviveType(obj.constraint));
        },
        intersection(obj, de) {
            return new IntersectionType(obj.types.map((t) => de.reviveType(t)));
        },
        intrinsic(obj) {
            return new IntrinsicType(obj.name);
        },
        literal(obj) {
            if (obj.value && typeof obj.value === "object") {
                return new LiteralType(
                    BigInt(
                        `${obj.value.negative ? "-" : ""}${obj.value.value}`,
                    ),
                );
            }
            return new LiteralType(obj.value);
        },
        mapped(obj, de) {
            return new MappedType(
                obj.parameter,
                de.reviveType(obj.parameterType),
                de.reviveType(obj.templateType),
                obj.readonlyModifier,
                obj.optionalModifier,
                de.reviveType(obj.nameType),
            );
        },
        optional(obj, de) {
            return new OptionalType(de.reviveType(obj.elementType));
        },
        predicate(obj, de) {
            return new PredicateType(
                obj.name,
                obj.asserts,
                de.reviveType(obj.targetType),
            );
        },
        query(obj, de) {
            return new QueryType(de.reviveType(obj.queryType));
        },
        reference(obj) {
            // Correct reference will be restored in fromObject
            return ReferenceType.createResolvedReference(obj.name, -2, null);
        },
        reflection(obj, de) {
            return new ReflectionType(
                de.revive(obj.declaration, (o) => de.constructReflection(o)),
            );
        },
        rest(obj, de) {
            return new RestType(de.reviveType(obj.elementType));
        },
        templateLiteral(obj, de) {
            return new TemplateLiteralType(
                obj.head,
                obj.tail.map(([t, s]) => [de.reviveType(t), s]),
            );
        },
        tuple(obj, de) {
            return new TupleType(
                obj.elements?.map((t) => de.reviveType(t)) || [],
            );
        },
        namedTupleMember(obj, de) {
            return new NamedTupleMember(
                obj.name,
                obj.isOptional,
                de.reviveType(obj.element),
            );
        },
        typeOperator(obj, de) {
            return new TypeOperatorType(
                de.reviveType(obj.target),
                obj.operator,
            );
        },
        union(obj, de) {
            return new UnionType(obj.types.map((t) => de.reviveType(t)));
        },
        unknown(obj) {
            return new UnknownType(obj.name);
        },
    };

    /**
     * Only set when deserializing.
     */
    projectRoot!: string;

    oldIdToNewId: Record<number, number | undefined> = {};
    oldFileIdToNewFileId: Record<number, number | undefined> = {};
    project: ProjectReflection | undefined;

    addDeserializer(de: DeserializerComponent): void {
        insertPrioritySorted(this.deserializers, de);
    }

    /**
     * Revive a single project into the structure it was originally created with.
     * This is generally not appropriate for merging multiple projects since projects may
     * contain reflections in their root, not inside a module.
     */
    reviveProject(
        projectObj: JSONOutput.ProjectReflection,
        name: string,
        projectRoot: string,
        registry: FileRegistry,
    ): ProjectReflection {
        ok(
            this.deferred.length === 0,
            "Deserializer.defer was called when not deserializing",
        );
        const project = new ProjectReflection(
            name || projectObj.name,
            registry,
        );
        project.registerReflection(project, undefined, undefined);
        this.project = project;
        this.projectRoot = projectRoot;
        this.oldIdToNewId = { [projectObj.id]: project.id };
        this.oldFileIdToNewFileId = {};
        this.fromObject(project, projectObj);

        const deferred = this.deferred;
        this.deferred = [];
        for (const def of deferred) {
            def(project);
        }

        ok(
            this.deferred.length === 0,
            "Work may not be double deferred when deserializing.",
        );

        ok(
            this.activeReflection.length === 0,
            "Imbalanced reflection deserialization",
        );

        this.project = undefined;
        this.projectRoot = undefined!;
        this.oldIdToNewId = {};
        this.oldFileIdToNewFileId = {};
        return project;
    }

    reviveProjects(
        name: string,
        projects: readonly JSONOutput.ProjectReflection[],
        projectRoot: string,
        registry: FileRegistry,
    ): ProjectReflection {
        if (projects.length === 1) {
            return this.reviveProject(projects[0], name, projectRoot, registry);
        }

        const project = new ProjectReflection(name, registry);
        this.project = project;
        this.projectRoot = projectRoot;

        for (const proj of projects) {
            ok(
                this.deferred.length === 0,
                "Deserializer.defer was called when not deserializing",
            );

            const projModule = new DeclarationReflection(
                proj.name,
                ReflectionKind.Module,
                project,
            );
            project.registerReflection(projModule, undefined, undefined);
            project.addChild(projModule);
            this.oldIdToNewId = { [proj.id]: projModule.id };
            this.oldFileIdToNewFileId = {};
            this.fromObject(projModule, proj);

            const deferred = this.deferred;
            this.deferred = [];
            for (const def of deferred) {
                def(project);
            }
            ok(
                this.deferred.length === 0,
                "Work may not be double deferred when deserializing.",
            );

            ok(
                this.activeReflection.length === 0,
                "Imbalanced reflection deserialization",
            );
        }

        this.oldIdToNewId = {};
        this.oldFileIdToNewFileId = {};
        this.project = undefined;
        this.projectRoot = undefined!;
        return project;
    }

    revive<T, U extends Deserializable<T>>(
        source: NonNullable<T>,
        creator: (obj: T) => U,
    ): U;
    revive<T, U extends Deserializable<T>>(
        source: T | undefined,
        creator: (obj: T) => U,
    ): U | undefined;
    revive<T, U extends Deserializable<T>>(
        source: T | undefined,
        creator: (obj: T) => U,
    ): U | undefined {
        if (source) {
            const revived = creator(source);
            this.fromObject(revived, source);
            return revived;
        }
    }

    reviveMany<T, U extends Deserializable<T>>(
        sourceArray: T[],
        creator: (obj: T) => U,
    ): U[];
    reviveMany<T, U extends Deserializable<T>>(
        sourceArray: T[] | undefined,
        creator: (obj: T) => U,
    ): U[] | undefined;
    reviveMany<T, U extends Deserializable<T>>(
        sourceArray: T[] | undefined,
        creator: (obj: T) => U,
    ): U[] | undefined {
        if (sourceArray) {
            return sourceArray.map((item) => {
                const revived = creator(item);
                this.fromObject(revived, item);
                return revived;
            });
        }
    }

    reviveType<T extends JSONOutput.SomeType>(obj: T): TypeKindMap[T["type"]];
    reviveType<T extends JSONOutput.SomeType>(
        obj: T | undefined,
    ): TypeKindMap[T["type"]] | undefined;
    reviveType(obj: JSONOutput.SomeType | undefined): SomeType | undefined {
        return this.revive(obj, (o) => this.constructType(o));
    }

    constructReflection<T extends JSONOutput.SomeReflection>(
        obj: T,
    ): ReflectionVariant[T["variant"]] {
        ok(this.activeReflection.length > 0);
        const result = this.reflectionBuilders[obj.variant](
            this.activeReflection[this.activeReflection.length - 1] as never,
            obj as never,
        );
        this.oldIdToNewId[obj.id] = result.id;
        this.project!.registerReflection(result, undefined, undefined);

        return result as any;
    }

    constructType<T extends JSONOutput.SomeType>(
        obj: T,
    ): TypeKindMap[T["type"]] {
        const result = this.typeBuilders[obj.type](obj as never, this);
        return result as any;
    }

    fromObject<T>(
        receiver: { fromObject(d: Deserializer, o: T): void },
        obj: T,
    ) {
        if (receiver instanceof Reflection) {
            this.activeReflection.push(receiver);
        }
        receiver.fromObject(this, obj);

        for (const de of this.deserializers) {
            if (de.supports(receiver, obj)) {
                de.fromObject(receiver, obj);
            }
        }

        if (receiver instanceof Reflection) {
            this.activeReflection.pop();
        }
    }

    /**
     * Defers work until the initial pass of serialization has been completed.
     * This can be used to set up references which cannot be immediately restored.
     *
     * May only be called when deserializing.
     */
    defer(cb: (project: ProjectReflection) => void) {
        this.deferred.push(cb);
    }
}
