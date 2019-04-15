import { Reflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class ReflectionSerializer extends ReflectionSerializerComponent<Reflection> {
    static PRIORITY: number;
    supports(t: unknown): boolean;
    toObject(reflection: Reflection, obj?: any): any;
}
