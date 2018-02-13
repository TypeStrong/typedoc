import { ProjectReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class ProjectReflectionSerializer extends ReflectionSerializerComponent<ProjectReflection> {
    static PRIORITY: number;
    initialize(): void;
    toObject(container: ProjectReflection, obj?: any): any;
}
