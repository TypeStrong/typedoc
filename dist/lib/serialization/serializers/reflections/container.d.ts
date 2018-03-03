import { ContainerReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class ContainerReflectionSerializer extends ReflectionSerializerComponent<ContainerReflection> {
    initialize(): void;
    toObject(container: ContainerReflection, obj?: any): any;
}
