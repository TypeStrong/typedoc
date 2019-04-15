import { ProjectReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class ProjectReflectionSerializer extends ReflectionSerializerComponent<ProjectReflection> {
    static PRIORITY: number;
    supports(t: unknown): boolean;
    toObject(container: ProjectReflection, obj?: any): any;
}
