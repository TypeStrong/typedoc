import { Component } from '../../../utils/component';
import { ArrayType } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:array-type'})
export class ArrayTypeSerializer extends TypeSerializerComponent<ArrayType> {

  supports(t: unknown) {
    return t instanceof ArrayType;
  }

  toObject(arrayType: ArrayType, obj?: any): any {
    obj = obj || {};

    obj.elementType = this.owner.toObject(arrayType.elementType);

    return obj;
  }

}
