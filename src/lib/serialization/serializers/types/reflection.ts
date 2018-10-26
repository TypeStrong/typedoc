import { Component } from '../../../utils/component';
import { DeclarationReflection, ReflectionType } from '../../../models';

import { TypeSerializerComponent } from '../../components';

@Component({name: 'serializer:reflection-type'})
export class ReflectionTypeSerializer extends TypeSerializerComponent<ReflectionType> {

  private declaration?: DeclarationReflection;

  supports(t: unknown) {
    return t instanceof ReflectionType;
  }

  toObject(reference: ReflectionType, obj?: any): any {
    obj = obj || {};

    if (reference.declaration) {

      // Because `DeclarationReflection` has reference to multiple types objectifying a declaration
      // on a type might fall into a loop trap (cyclic dependency).
      // The TypeDoc code does not apply logic that can create this scenario but a 3rd party plugin
      // might do that unintentionally so a protection is in place.

      if (this.declaration === reference.declaration) {
        // if we're here it means that the reference type is rendered for the 2nd time
        // by the declaration it is referencing, we will render a pointer-only declaration.
        obj.declaration = { id: reference.declaration.id };
      } else {
        // mark this declaration to trap a loop
        this.declaration = reference.declaration;

        // objectify the declaration
        obj.declaration = this.owner.toObject(reference.declaration);
      }

      // no more declaration rendering, remove marker.
      this.declaration = undefined;
    }

    return obj;
  }
}
