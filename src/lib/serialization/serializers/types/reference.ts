import { Component } from '../../../utils/component';
import { ReferenceType } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:reference-type'})
export class ReferenceTypeSerializer extends TypeSerializerComponent<ReferenceType> {

  supports(t: unknown) {
    return t instanceof ReferenceType;
  }

  toObject(reference: ReferenceType, obj?: any): any {
    obj = obj || {};

    obj.name = reference.name;

    if (reference.reflection) {
      obj.id = reference.reflection.id;
    }

    if (reference.typeArguments && reference.typeArguments.length > 0) {
      obj.typeArguments = reference.typeArguments.map( t => this.owner.toObject(t) );
    }

    return obj;
  }

}
