import { ArrayType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class ArrayTypeSerializer extends TypeSerializerComponent<ArrayType> {
    initialize(): void;
    toObject(arrayType: ArrayType, obj?: any): any;
}
