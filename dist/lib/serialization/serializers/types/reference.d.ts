import { ReferenceType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class ReferenceTypeSerializer extends TypeSerializerComponent<ReferenceType> {
    initialize(): void;
    toObject(reference: ReferenceType, obj?: any): any;
}
