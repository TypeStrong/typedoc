import { TypeOperatorType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class TypeOperatorTypeSerializer extends TypeSerializerComponent<TypeOperatorType> {
    supports(t: unknown): boolean;
    toObject(typeOperator: TypeOperatorType, obj?: any): any;
}
