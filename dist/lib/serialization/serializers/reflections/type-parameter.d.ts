import { TypeParameterReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class TypeParameterReflectionSerializer extends ReflectionSerializerComponent<TypeParameterReflection> {
    initialize(): void;
    toObject(typeParameter: TypeParameterReflection, obj?: any): any;
}
