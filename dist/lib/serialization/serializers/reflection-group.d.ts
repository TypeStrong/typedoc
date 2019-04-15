import { ReflectionGroup } from '../../models/ReflectionGroup';
import { SerializerComponent } from '../components';
export declare class ReflectionGroupSerializer extends SerializerComponent<ReflectionGroup> {
    static PRIORITY: number;
    serializeGroup(instance: any): boolean;
    serializeGroupSymbol: typeof ReflectionGroup;
    initialize(): void;
    supports(r: unknown): boolean;
    toObject(group: ReflectionGroup, obj?: any): any;
}
