import { Component } from '../../../utils/component';
import { ProjectReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';
import { ContainerReflectionSerializer } from './container';

@Component({name: 'serializer:project-reflection'})
export class ProjectReflectionSerializer extends ReflectionSerializerComponent<ProjectReflection> {

  static PRIORITY = ContainerReflectionSerializer.PRIORITY - 1; // mimic inheritance, run after parent

  initialize(): void {
    super.initialize();
    this.supports = (r: ProjectReflection) => r instanceof ProjectReflection;
  }

  toObject(container: ProjectReflection, obj?: any): any {
    return obj;
  }

}
