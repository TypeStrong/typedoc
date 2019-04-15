import { ReflectionType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class ReflectionTypeSerializer extends TypeSerializerComponent<ReflectionType> {
    private declaration?;
    supports(t: unknown): boolean;
    toObject(reference: ReflectionType, obj?: any): any;
}
