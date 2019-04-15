import { IntrinsicType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class IntrinsicTypeSerializer extends TypeSerializerComponent<IntrinsicType> {
    supports(t: unknown): boolean;
    toObject(intrinsic: IntrinsicType, obj?: any): any;
}
