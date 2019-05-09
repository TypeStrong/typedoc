import { SignatureReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

export class SignatureReflectionSerializer extends ReflectionSerializerComponent<SignatureReflection> {
    supports(t: unknown) {
        return t instanceof SignatureReflection;
    }

    toObject(signature: SignatureReflection, obj: JSONOutput.Reflection): JSONOutput.SignatureReflection {
        const result: JSONOutput.SignatureReflection = { ...obj };

        if (signature.type) {
            result.type = this.owner.toObject(signature.type);
        }

        if (signature.overwrites) {
            result.overwrites = this.owner.toObject(signature.overwrites);
        }

        if (signature.inheritedFrom) {
            result.inheritedFrom = this.owner.toObject(signature.inheritedFrom);
        }

        if (signature.implementationOf) {
            result.implementationOf = this.owner.toObject(signature.implementationOf);
        }

        return result;
    }
}
