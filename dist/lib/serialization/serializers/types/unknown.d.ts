import { UnknownType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class UnknownTypeSerializer extends TypeSerializerComponent<UnknownType> {
    supports(t: unknown): boolean;
    toObject(unknown: UnknownType, obj?: any): any;
}
