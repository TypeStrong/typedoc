import { StringLiteralType } from '../../../models';

import { TypeSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

export class StringLiteralTypeSerializer extends TypeSerializerComponent<StringLiteralType> {
    supports(t: unknown) {
        return t instanceof StringLiteralType;
    }

    toObject(type: StringLiteralType, obj: Pick<JSONOutput.StringLiteralType, 'type'>): JSONOutput.StringLiteralType {
        return {
            ...obj,
            value: type.value
        };
    }
}
