import { Reflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class ReflectionSerializer extends ReflectionSerializerComponent<Reflection> {
    static PRIORITY: number;
    initialize(): void;
    toObject(reflection: Reflection, obj?: any): any;
}
