import { StringLiteralType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class StringLiteralTypeSerializer extends TypeSerializerComponent<StringLiteralType> {
    supports(t: unknown): boolean;
    toObject(stringLiteral: StringLiteralType, obj?: any): any;
}
