import { ArrayType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class ArrayTypeSerializer extends TypeSerializerComponent<ArrayType> {
    supports(t: unknown): boolean;
    toObject(arrayType: ArrayType, obj?: any): any;
}
