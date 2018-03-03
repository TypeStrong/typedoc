import { StringLiteralType } from '../../../models';
import { TypeSerializerComponent } from '../../components';
export declare class StringLiteralTypeSerializer extends TypeSerializerComponent<StringLiteralType> {
    initialize(): void;
    toObject(stringLiteral: StringLiteralType, obj?: any): any;
}
