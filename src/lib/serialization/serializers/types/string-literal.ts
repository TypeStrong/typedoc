import { Component } from '../../../utils/component';
import { StringLiteralType } from '../../../models';

import { TypeSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

@Component({ name: 'serializer:string-literal-type' })
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
