import { TypeParameterType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class TypeParameterTypeSerializer extends TypeSerializerComponent<TypeParameterType> {
    supports(t: unknown): boolean;
    toObject(typeParameter: TypeParameterType, obj?: any): any;
}
