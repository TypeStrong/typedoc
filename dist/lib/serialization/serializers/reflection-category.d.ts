import { ReflectionCategory } from '../../models/ReflectionCategory';
import { SerializerComponent } from '../components';
export declare class ReflectionCategorySerializer extends SerializerComponent<ReflectionCategory> {
    static PRIORITY: number;
    serializeGroup(instance: any): boolean;
    serializeGroupSymbol: typeof ReflectionCategory;
    initialize(): void;
    supports(r: unknown): boolean;
    toObject(category: ReflectionCategory, obj?: any): any;
}
