import { Component } from '../../../utils/component';
import { DeclarationReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';
import { ContainerReflectionSerializer } from './container';

@Component({name: 'serializer:declaration-reflection'})
export class DeclarationReflectionSerializer extends ReflectionSerializerComponent<DeclarationReflection> {

  static PRIORITY = ContainerReflectionSerializer.PRIORITY - 1; // mimic inheritance, run after parent

  supports(t: unknown) {
    return t instanceof DeclarationReflection;
  }

  toObject(declaration: DeclarationReflection, obj?: any): any {
    obj = obj || {};

    if (declaration.type) {
      obj.type = this.owner.toObject(declaration.type);
    }

    if (declaration.defaultValue) {
      obj.defaultValue = declaration.defaultValue;
    }

    if (declaration.overwrites) {
      obj.overwrites = this.owner.toObject(declaration.overwrites);
    }

    if (declaration.inheritedFrom) {
      obj.inheritedFrom = this.owner.toObject(declaration.inheritedFrom);
    }

    if (declaration.extendedTypes) {
      obj.extendedTypes = declaration.extendedTypes.map((t) => this.owner.toObject(t) );
    }

    if (declaration.extendedBy) {
      obj.extendedBy = declaration.extendedBy.map((t) => this.owner.toObject(t) );
    }

    if (declaration.implementedTypes) {
      obj.implementedTypes = declaration.implementedTypes.map((t) => this.owner.toObject(t) );
    }

    if (declaration.implementedBy) {
      obj.implementedBy = declaration.implementedBy.map((t) => this.owner.toObject(t) );
    }

    if (declaration.implementationOf) {
      obj.implementationOf = this.owner.toObject(declaration.implementationOf);
    }

    return obj;
  }

}
