import { Component } from '../../../utils/component';
import { TupleType } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:tuple-type'})
export class TupleTypeSerializer extends TypeSerializerComponent<TupleType> {

  initialize(): void {
    super.initialize();
    this.supports = (t: TupleType) => t instanceof TupleType;
  }

  toObject(tuple: TupleType, obj?: any): any {
    obj = obj || {};

    if (tuple.elements && tuple.elements.length > 0) {
      obj.elements = tuple.elements.map( t => this.owner.toObject(t) );
    }

    return obj;
  }

}
