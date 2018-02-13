import { SignatureReflection } from '../../../models';
import { ReflectionSerializerComponent } from '../../components';
export declare class SignatureReflectionSerializer extends ReflectionSerializerComponent<SignatureReflection> {
    initialize(): void;
    toObject(signature: SignatureReflection, obj?: any): any;
}
