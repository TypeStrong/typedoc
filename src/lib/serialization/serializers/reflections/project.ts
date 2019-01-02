import { Component } from '../../../utils/component';
import { ProjectReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';
import { ContainerReflectionSerializer } from './container';
import { JSONOutput } from '../../schema';

@Component({ name: 'serializer:project-reflection' })
export class ProjectReflectionSerializer extends ReflectionSerializerComponent<ProjectReflection> {
    static PRIORITY = ContainerReflectionSerializer.PRIORITY - 1; // mimic inheritance, run after parent

    supports(t: unknown) {
        return t instanceof ProjectReflection;
    }

    toObject(container: ProjectReflection, obj: JSONOutput.ContainerReflection): JSONOutput.ProjectReflection {
        return obj;
    }
}
