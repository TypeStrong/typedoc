import { SerializerComponent } from '../components';
import { DecoratorWrapper } from './models/decorator-wrapper';
import { JSONOutput } from '../schema';

export class DecoratorContainerSerializer extends SerializerComponent<DecoratorWrapper> {
    static PRIORITY = 1000;

    /**
     * Filter for instances of [[DecoratorWrapper]]
     */
    serializeGroup(instance: unknown): boolean {
        return instance instanceof DecoratorWrapper;
    }

    supports(_: unknown) {
        return true;
    }

    toObject({ decorator }: DecoratorWrapper, obj?: Partial<JSONOutput.Decorator>): JSONOutput.Decorator {
        const result: JSONOutput.Decorator = {
            ...obj,
            name: decorator.name
        };

        if (decorator.type) {
            result.type = this.owner.toObject(decorator.type);
        }

        if (decorator.arguments) {
            result.arguments = decorator.arguments;
        }

        return result;
    }
}
