import { ParameterReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class ParameterReflectionSerializer extends ReflectionSerializerComponent<ParameterReflection> {
    initialize(): void;
    toObject(parameter: ParameterReflection, obj?: any): any;
}
