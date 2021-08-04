import * as util from "util";
import { EventDispatcher } from "../utils";
import {
    ProjectReflection, Reflection, DeclarationReflection, ReferenceReflection, ParameterReflection, SignatureReflection, TypeParameterReflection, Comment, SourceFile, IntrinsicType,
    ReflectionGroup,
    ReferenceType, ArrayType, CommentTag, ConditionalType, ContainerReflection, IndexedAccessType, InferredType, IntersectionType, LiteralType, MappedType, NamedTupleMember, OptionalType, PredicateType, QueryType, ReflectionCategory, ReflectionFlag, ReflectionFlags, ReflectionKind, ReflectionType, RestType, SourceDirectory, TemplateLiteralType, TraverseProperty, TupleType, Type, TypeOperatorType, TypeParameterType, UnionType, UnknownType
} from "../models";

import { SerializerComponent } from "./components";
import { SerializeEvent, SerializeEventData } from "./events";
import { ModelToObject } from "./schema";
import * as S from "./serializers";
import { NamespaceResolver, Resurrect } from "resurrect-ts";

export class Serializer extends EventDispatcher {
    /**
     * Triggered when the [[Serializer]] begins transforming a project.
     * @event EVENT_BEGIN
     */
    static EVENT_BEGIN = "begin";

    /**
     * Triggered when the [[Serializer]] has finished transforming a project.
     * @event EVENT_END
     */
    static EVENT_END = "end";

    /**
     * Serializers, sorted by their `serializeGroup` function to enable higher performance.
     */
    private serializers = new Map<
        (instance: unknown) => boolean,
        SerializerComponent<any>[]
    >();

    constructor() {
        super();
        addSerializers(this);
    }

    serializersById: Map<string, SerializerComponent<any>> = new Map();

    addSerializer(serializer: SerializerComponent<any>): void {
        let group = this.serializers.get(serializer.serializeGroup);

        if (!group) {
            this.serializers.set(serializer.serializeGroup, (group = []));
        }

        group.push(serializer);
        group.sort((a, b) => b.priority - a.priority);
        this.serializersById.set(serializer.id, serializer);
    }

    toObject<T>(value: T, init?: object): ModelToObject<T>;
    toObject(value: unknown, init: object = {}): unknown {
        if (value == null || typeof value !== "object") {
            return value; // Serializing some primitive
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return undefined;
            }
            return value.map((val) => this.toObject(val));
        }

        // Note: This type *could* potentially lie, if a serializer declares a partial type but fails to provide
        // the defined property, but the benefit of being mostly typed is probably worth it.
        // TypeScript errors out if init is correctly typed as `Partial<ModelToObject<T>>`
        return this.findSerializers(value).reduce<any>(
            (result, curr) => {
                // result.$serializers = result.$serializers || [];
                // result.$serializers.push(curr.id);
                return curr.toObject(value, result);
            },
            init
        );
    }

    fromObject(obj: any): any {
        if (obj == null || typeof obj !== "object") {
            return obj; // Deserializing some primitive
        }

        if (Array.isArray(obj)) {
            if (obj.length === 0) {
                return undefined;
            }
            return obj.map((obj) => this.fromObject(obj));
        }

        const $serializers = obj.$serializers as string[];
        const serializers = $serializers.map(id => this.serializersById.get(id)!);
        let deserializedValue: any = undefined;
        for(const serializer of serializers) {
            const v = serializer.createFromObject(obj);
            if(v) {
                deserializedValue = v;
                break;
            }
        }
        if(deserializedValue === undefined) {
            throw new Error(`no serializers are able to create an object for serialized object: ${util.inspect(obj)}`)
        }
        for(const serializer of serializers) {
            serializer.fromObject(deserializedValue, obj);
        }
        return deserializedValue;
    }

    idToReflection!: Map<number, Reflection>;
    projectFromObject(obj: ModelToObject<ProjectReflection>): any {
        this.idToReflection = new Map();
        try {
            this.fromObject(obj);
        } finally {
            this.idToReflection = undefined as any;
        }
    }

    /**
     * Same as toObject but emits [[ Serializer#EVENT_BEGIN ]] and [[ Serializer#EVENT_END ]] events.
     * @param value
     * @param eventData Partial information to set in the event
     */
    projectToObject(
        value: ProjectReflection,
        eventData: { begin?: SerializeEventData; end?: SerializeEventData } = {}
    ): ModelToObject<ProjectReflection> {
        const eventBegin = new SerializeEvent(
            Serializer.EVENT_BEGIN,
            value,
            {}
        );
        if (eventData.begin) {
            eventBegin.outputDirectory = eventData.begin.outputDirectory;
            eventBegin.outputFile = eventData.begin.outputFile;
        }
        this.trigger(eventBegin);

        // const project = this.toObject(value, eventBegin.output);
        const ctx = {
            __proto__: null,
            ProjectReflection,
            DeclarationReflection,
            Reflection,
            ReferenceReflection,
            ParameterReflection,
            SignatureReflection,
            TypeParameterReflection,
            Comment,
            SourceFile,
            IntrinsicType,
            ReflectionGroup,
            ReferenceType,
            ArrayType, CommentTag, ConditionalType, ContainerReflection, IndexedAccessType, InferredType, IntersectionType, LiteralType, MappedType, NamedTupleMember, OptionalType, PredicateType, QueryType, ReflectionCategory, ReflectionFlag, ReflectionFlags, ReflectionKind, ReflectionType, RestType, SourceDirectory, TemplateLiteralType, TraverseProperty, TupleType, Type, TypeOperatorType, TypeParameterType, UnionType, UnknownType
        };

        const resurrector = new Resurrect({
            resolver: new NamespaceResolver(ctx)
        });
        const project = JSON.parse(resurrector.stringify(value, function(this: any, key: string, value: any) {
            if(value instanceof ReferenceType) {
                value.reflection; // trigger resolution
            }
            if(value instanceof ReferenceReflection) {
                value.tryGetTargetReflection(); // trigger resolution
            }
            // If resolution above does not eliminate ts.Symbol reference, it means resolutions above return `undefined`
            // It is safe to skip serialization of _target; will be equivalent.
            if((this instanceof ReferenceReflection || this instanceof ReferenceType) && key === '_target' && typeof value !== 'number') {
                return -1;
            }
            if(value instanceof Map) return undefined;
            return value;
        }, '  '));

        const eventEnd = new SerializeEvent(
            Serializer.EVENT_END,
            value,
            project
        );
        if (eventData.end) {
            eventBegin.outputDirectory = eventData.end.outputDirectory;
            eventBegin.outputFile = eventData.end.outputFile;
        }
        this.trigger(eventEnd);

        // HACK resurrect, then replace all project fields with the resurrected
        // values.
        const fromJson = resurrector.resurrect(JSON.stringify(project));
        console.dir(fromJson);
        for(const prop of Object.getOwnPropertyNames(value)) {
            if(Object.prototype.hasOwnProperty.call(fromJson, prop)) {
                (value as any)[prop] = fromJson[prop];
            } else {
                delete (value as any)[prop];
            }
        }

        return project;
    }

    private findSerializers<T>(value: T): SerializerComponent<T>[] {
        const routes: SerializerComponent<any>[] = [];

        for (const [groupSupports, components] of this.serializers.entries()) {
            if (groupSupports(value)) {
                for (const component of components) {
                    if (component.supports(value)) {
                        routes.push(component);
                    }
                }
            }
        }

        return routes as any;
    }
}

const serializerComponents: (new (
    owner: Serializer
) => SerializerComponent<any>)[] = [
    S.CommentTagSerializer,
    S.CommentSerializer,

    S.ReflectionSerializer,
    S.ReferenceReflectionSerializer,
    S.ContainerReflectionSerializer,
    S.DeclarationReflectionSerializer,
    S.ParameterReflectionSerializer,
    S.SignatureReflectionSerializer,
    S.TypeParameterReflectionSerializer,

    S.SourceReferenceContainerSerializer,

    S.TypeSerializer,
    S.ArrayTypeSerializer,
    S.ConditionalTypeSerializer,
    S.IndexedAccessTypeSerializer,
    S.InferredTypeSerializer,
    S.IntersectionTypeSerializer,
    S.IntrinsicTypeSerializer,
    S.OptionalTypeSerializer,
    S.PredicateTypeSerializer,
    S.QueryTypeSerializer,
    S.ReferenceTypeSerializer,
    S.ReferenceTypeSerializer,
    S.ReflectionTypeSerializer,
    S.RestTypeSerializer,
    S.LiteralTypeSerializer,
    S.TupleTypeSerializer,
    S.TemplateLiteralTypeSerializer,
    S.NamedTupleMemberTypeSerializer,
    S.MappedTypeSerializer,
    S.TypeOperatorTypeSerializer,
    S.UnionTypeSerializer,
    S.UnknownTypeSerializer,

    S.DecoratorContainerSerializer,
    S.ReflectionCategorySerializer,
    S.ReflectionGroupSerializer,
];

function addSerializers(owner: Serializer) {
    for (const component of serializerComponents) {
        owner.addSerializer(new component(owner));
    }
}
