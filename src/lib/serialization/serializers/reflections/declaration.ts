import { DeclarationReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';
import { ContainerReflectionSerializer } from './container';
import { JSONOutput } from '../../schema';

export class DeclarationReflectionSerializer extends ReflectionSerializerComponent<DeclarationReflection> {
    static PRIORITY = ContainerReflectionSerializer.PRIORITY - 1; // mimic inheritance, run after parent

    supports(t: unknown) {
        return t instanceof DeclarationReflection;
    }

    toObject(declaration: DeclarationReflection, obj: JSONOutput.ContainerReflection): JSONOutput.DeclarationReflection {
        const result: JSONOutput.DeclarationReflection = {
            ...obj
        };

        if (declaration.type) {
            result.type = this.owner.toObject(declaration.type);
        }

        if (declaration.defaultValue) {
            result.defaultValue = declaration.defaultValue;
        }

        if (declaration.overwrites) {
            result.overwrites = this.owner.toObject(declaration.overwrites);
        }

        if (declaration.inheritedFrom) {
            result.inheritedFrom = this.owner.toObject(declaration.inheritedFrom);
        }

        if (declaration.extendedTypes) {
            result.extendedTypes = declaration.extendedTypes.map(t => this.owner.toObject(t));
        }

        if (declaration.extendedBy) {
            result.extendedBy = declaration.extendedBy.map(t => this.owner.toObject(t));
        }

        if (declaration.implementedTypes) {
            result.implementedTypes = declaration.implementedTypes.map(t => this.owner.toObject(t));
        }

        if (declaration.implementedBy) {
            result.implementedBy = declaration.implementedBy.map(t => this.owner.toObject(t));
        }

        if (declaration.implementationOf) {
            result.implementationOf = this.owner.toObject(declaration.implementationOf);
        }

        return result;
    }
}
