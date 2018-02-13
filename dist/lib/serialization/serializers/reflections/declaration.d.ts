import { DeclarationReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class DeclarationReflectionSerializer extends ReflectionSerializerComponent<DeclarationReflection> {
    static PRIORITY: number;
    initialize(): void;
    toObject(declaration: DeclarationReflection, obj?: any): any;
}
