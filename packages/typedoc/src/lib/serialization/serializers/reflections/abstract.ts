import { Component } from '../../../utils/component';
import { Reflection, TraverseProperty } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';
import { DecoratorWrapper } from '../models';

@Component({name: 'serializer:reflection'})
export class ReflectionSerializer extends ReflectionSerializerComponent<Reflection> {

  static PRIORITY = 1000;

  initialize(): void {
    super.initialize();
    this.supports = (r: Reflection) => true;
  }

  toObject(reflection: Reflection, obj?: any): any {
    obj = obj || {};

    Object.assign(obj, {
      id:         reflection.id,
      name:       reflection.name,
      kind:       reflection.kind,
      kindString: reflection.kindString,
      flags:      {}                      // TODO: remove if no flags
    });

    if (reflection.originalName !== reflection.name) {
      obj.originalName = reflection.originalName;
    }

    if (reflection.comment) {
      obj.comment = this.owner.toObject(reflection.comment);
    }

    for (let key in reflection.flags) {
      // tslint:disable-next-line:triple-equals
      if (parseInt(key, 10) == <any> key || key === 'flags') {
        continue;
      }
      if (reflection.flags[key]) {
        obj.flags[key] = true;
      }
    }

    if (reflection.decorates && reflection.decorates.length > 0) {
      obj.decorates = reflection.decorates.map( t => this.owner.toObject(t) );
    }

    if (reflection.decorators && reflection.decorators.length > 0) {
      obj.decorators = reflection.decorators.map( d => this.owner.toObject(new DecoratorWrapper(d)) );
    }

    reflection.traverse((child, property) => {
      if (property === TraverseProperty.TypeLiteral) {
        return;
      }
      let name = TraverseProperty[property];
      name = name.substr(0, 1).toLowerCase() + name.substr(1);
      switch (property) {
        case TraverseProperty.GetSignature:
        case TraverseProperty.SetSignature:
        case TraverseProperty.IndexSignature:
          obj[name] = this.owner.toObject(child);
          break;
        default:
          if (!obj[name]) {
            obj[name] = [];
          }
          obj[name].push(this.owner.toObject(child));
          break;
      }
    });

    return obj;
  }
}
