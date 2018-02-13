import { UnknownType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class UnknownTypeSerializer extends TypeSerializerComponent<UnknownType> {
    initialize(): void;
    toObject(unknown: UnknownType, obj?: any): any;
}
