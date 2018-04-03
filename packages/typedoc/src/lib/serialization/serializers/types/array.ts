import { Component } from '../../../utils/component';
import { ArrayType } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:array-type'})
export class ArrayTypeSerializer extends TypeSerializerComponent<ArrayType> {

  initialize(): void {
    super.initialize();
    this.supports = (t: ArrayType) => t instanceof ArrayType;
  }

  toObject(arrayType: ArrayType, obj?: any): any {
    obj = obj || {};

    obj.elementType = this.owner.toObject(arrayType.elementType);

    return obj;
  }

}
