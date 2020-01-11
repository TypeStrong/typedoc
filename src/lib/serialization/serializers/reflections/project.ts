import { ProjectReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';
import { ContainerReflectionSerializer } from './container';
import {
    ProjectReflection as JSONProjectReflection,
    ContainerReflection as JSONContainerReflection
} from '../../schema';

export class ProjectReflectionSerializer extends ReflectionSerializerComponent<ProjectReflection> {
    static PRIORITY = ContainerReflectionSerializer.PRIORITY - 1; // mimic inheritance, run after parent

    supports(t: unknown) {
        return t instanceof ProjectReflection;
    }

    toObject(container: ProjectReflection, obj: JSONContainerReflection): JSONProjectReflection {
        return obj;
    }
}
