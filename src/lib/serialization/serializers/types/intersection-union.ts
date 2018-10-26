import { Component } from '../../../utils/component';
import { IntersectionType, UnionType } from '../../../models';

import { TypeSerializerComponent } from '../../components';

export type IntersectionUnion = IntersectionType | UnionType;

@Component({name: 'serializer:intersection-type'})
export class IntersectionTypeSerializer extends TypeSerializerComponent<IntersectionUnion> {

  supports(t: unknown) {
    return t instanceof IntersectionType || t instanceof UnionType;
  }

  toObject(intersectionUnion: IntersectionUnion, obj?: any): any {
    obj = obj || {};

    if (intersectionUnion.types && intersectionUnion.types.length) {
      obj.types = intersectionUnion.types.map( t => this.owner.toObject(t) );
    }

    return obj;
  }

}
