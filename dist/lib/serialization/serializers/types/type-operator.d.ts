import { TypeOperatorType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class TypeOperatorTypeSerializer extends TypeSerializerComponent<TypeOperatorType> {
    initialize(): void;
    toObject(typeOperator: TypeOperatorType, obj?: any): any;
}
