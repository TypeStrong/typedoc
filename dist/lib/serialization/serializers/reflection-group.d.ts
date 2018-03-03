import { ReflectionGroup } from '../../models/ReflectionGroup';
import { SerializerComponent } from '../components';
export declare class ReflectionGroupSerializer extends SerializerComponent<ReflectionGroup> {
    static PRIORITY: number;
    protected static serializeGroup(instance: any): boolean;
    serializeGroup: typeof ReflectionGroupSerializer.serializeGroup;
    serializeGroupSymbol: typeof ReflectionGroup;
    initialize(): void;
    toObject(group: ReflectionGroup, obj?: any): any;
}
