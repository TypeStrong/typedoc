import { Component } from '../../../utils/component';
import { IntrinsicType } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:intrinsic-type'})
export class IntrinsicTypeSerializer extends TypeSerializerComponent<IntrinsicType> {

  supports(t: unknown) {
    return t instanceof IntrinsicType;
  }

  toObject(intrinsic: IntrinsicType, obj?: any): any {
    obj = obj || {};

    obj.name = intrinsic.name;

    return obj;
  }

}
