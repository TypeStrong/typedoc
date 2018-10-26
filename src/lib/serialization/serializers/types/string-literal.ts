import { Component } from '../../../utils/component';
import { StringLiteralType } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:string-literal-type'})
export class StringLiteralTypeSerializer extends TypeSerializerComponent<StringLiteralType> {

  supports(t: unknown) {
    return t instanceof StringLiteralType;
  }

  toObject(stringLiteral: StringLiteralType, obj?: any): any {
    obj = obj || {};

    obj.value = stringLiteral.value;

    return obj;
  }

}
