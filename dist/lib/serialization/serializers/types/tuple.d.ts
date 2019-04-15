import { TupleType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class TupleTypeSerializer extends TypeSerializerComponent<TupleType> {
    supports(t: unknown): boolean;
    toObject(tuple: TupleType, obj?: any): any;
}
