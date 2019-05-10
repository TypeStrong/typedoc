import { Component } from '../../../utils/component';
import { ContainerReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';
import { SourceReferenceWrapper } from '../models';

@Component({name: 'serializer:container-reflection'})
export class ContainerReflectionSerializer extends ReflectionSerializerComponent<ContainerReflection> {

  supports(t: unknown) {
    return t instanceof ContainerReflection;
  }

  toObject(container: ContainerReflection, obj?: any): any {
    obj = obj || {};

    if (container.groups && container.groups.length > 0) {
      obj.groups = container.groups.map( group => this.owner.toObject(group) );
    }

    if (container.categories && container.categories.length > 0) {
      obj.categories = container.categories.map( category => this.owner.toObject(category) );
    }

    if (container.sources && container.sources.length > 0) {
      obj.sources = container.sources
        .map( source => this.owner
          .toObject(new SourceReferenceWrapper({
            fileName: source.fileName,
            line: source.line,
            character: source.character
          }))
        );
    }

    return obj;
  }

}
