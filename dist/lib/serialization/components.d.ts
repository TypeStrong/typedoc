import { Reflection, Type } from '../models';
import { AbstractComponent } from '../utils';
import { Serializer } from './serializer';
export declare abstract class SerializerComponent<T> extends AbstractComponent<Serializer> {
    static PRIORITY: number;
    abstract serializeGroup(instance: unknown): boolean;
    abstract serializeGroupSymbol: any;
    readonly priority: number;
    abstract supports(item: unknown): boolean;
    abstract toObject(item: T, obj?: any): any;
}
export declare abstract class ReflectionSerializerComponent<T extends Reflection> extends SerializerComponent<T> {
    serializeGroup(instance: unknown): boolean;
    serializeGroupSymbol: typeof Reflection;
}
export declare abstract class TypeSerializerComponent<T extends Type> extends SerializerComponent<T> {
    serializeGroup(instance: unknown): boolean;
    serializeGroupSymbol: typeof Type;
}
