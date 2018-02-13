import { ReflectionType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class ReflectionTypeSerializer extends TypeSerializerComponent<ReflectionType> {
    private declaration;
    initialize(): void;
    toObject(reference: ReflectionType, obj?: any): any;
}
