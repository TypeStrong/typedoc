import { Reflection, Type } from '../models';
import { AbstractComponent } from '../utils';
import { Serializer } from './serializer';
export declare abstract class SerializerComponent<T> extends AbstractComponent<Serializer> {
    static PRIORITY: number;
    abstract serializeGroup: (instance: boolean) => boolean;
    abstract serializeGroupSymbol: any;
    readonly priority: number;
    supports: (item: T) => boolean;
    abstract toObject(item: T, obj?: any): any;
}
export declare abstract class ReflectionSerializerComponent<T extends Reflection> extends SerializerComponent<T> {
    protected static serializeGroup(instance: any): boolean;
    serializeGroup: typeof ReflectionSerializerComponent.serializeGroup;
    serializeGroupSymbol: typeof Reflection;
    supports: (reflection: T) => boolean;
    abstract toObject(reflection: T, obj?: any): any;
}
export declare abstract class TypeSerializerComponent<T extends Type> extends SerializerComponent<T> {
    protected static serializeGroup(instance: any): boolean;
    serializeGroup: typeof TypeSerializerComponent.serializeGroup;
    serializeGroupSymbol: typeof Type;
    supports: (type: T) => boolean;
    abstract toObject(type: T, obj?: any): any;
}
