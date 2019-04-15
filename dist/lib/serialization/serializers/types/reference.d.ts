import { ReferenceType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class ReferenceTypeSerializer extends TypeSerializerComponent<ReferenceType> {
    supports(t: unknown): boolean;
    toObject(reference: ReferenceType, obj?: any): any;
}
