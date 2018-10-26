import { Component } from '../../../utils/component';
import { SignatureReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';

@Component({name: 'serializer:signature-reflection'})
export class SignatureReflectionSerializer extends ReflectionSerializerComponent<SignatureReflection> {

  supports(t: unknown) {
    return t instanceof SignatureReflection;
  }

  toObject(signature: SignatureReflection, obj?: any): any {
    obj = obj || {};

    if (signature.type) {
      obj.type = this.owner.toObject(signature.type);
    }

    if (signature.overwrites) {
      obj.overwrites = this.owner.toObject(signature.overwrites);
    }

    if (signature.inheritedFrom) {
      obj.inheritedFrom = this.owner.toObject(signature.inheritedFrom);
    }

    if (signature.implementationOf) {
      obj.implementationOf = this.owner.toObject(signature.implementationOf);
    }

    return obj;
  }

}
