import { Type } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class TypeSerializer extends TypeSerializerComponent<Type> {
    static PRIORITY: number;
    initialize(): void;
    toObject(type: Type, obj?: any): any;
}
