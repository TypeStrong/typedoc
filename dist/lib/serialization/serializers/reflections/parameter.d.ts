import { ParameterReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class ParameterReflectionSerializer extends ReflectionSerializerComponent<ParameterReflection> {
    supports(t: unknown): boolean;
    toObject(parameter: ParameterReflection, obj?: any): any;
}
