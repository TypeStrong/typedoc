import { Type } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class TypeSerializer extends TypeSerializerComponent<Type> {
    static PRIORITY: number;
    supports(t: unknown): boolean;
    toObject(type: Type, obj?: any): any;
}
