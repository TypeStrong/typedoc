import { ContainerReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class ContainerReflectionSerializer extends ReflectionSerializerComponent<ContainerReflection> {
    supports(t: unknown): boolean;
    toObject(container: ContainerReflection, obj?: any): any;
}
