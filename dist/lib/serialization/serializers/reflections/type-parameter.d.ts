import { TypeParameterReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class TypeParameterReflectionSerializer extends ReflectionSerializerComponent<TypeParameterReflection> {
    supports(t: unknown): boolean;
    toObject(typeParameter: TypeParameterReflection, obj?: any): any;
}
