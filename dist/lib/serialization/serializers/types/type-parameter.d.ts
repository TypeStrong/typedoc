import { TypeParameterType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class TypeParameterTypeSerializer extends TypeSerializerComponent<TypeParameterType> {
    initialize(): void;
    toObject(typeParameter: TypeParameterType, obj?: any): any;
}
