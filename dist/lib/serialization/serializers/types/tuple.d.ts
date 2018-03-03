import { TupleType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class TupleTypeSerializer extends TypeSerializerComponent<TupleType> {
    initialize(): void;
    toObject(tuple: TupleType, obj?: any): any;
}
