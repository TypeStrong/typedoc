import { IntrinsicType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class IntrinsicTypeSerializer extends TypeSerializerComponent<IntrinsicType> {
    initialize(): void;
    toObject(intrinsic: IntrinsicType, obj?: any): any;
}
