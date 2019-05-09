import { ContainerReflection } from '../../../models';

import { ReflectionSerializerComponent } from '../../components';
import { SourceReferenceWrapper } from '../models';
import { JSONOutput } from '../../schema';

export class ContainerReflectionSerializer extends ReflectionSerializerComponent<ContainerReflection> {
    supports(t: unknown) {
        return t instanceof ContainerReflection;
    }

    /**
     * Will be run after [[ReflectionSerializer]] so will be passed the result of that serialization.
     * @param container
     * @param obj
     */
    toObject(container: ContainerReflection, obj: JSONOutput.Reflection): JSONOutput.ContainerReflection {
        const result: JSONOutput.ContainerReflection = {
            ...obj
        };

        if (container.groups && container.groups.length > 0) {
            result.groups = container.groups.map(group => this.owner.toObject(group));
        }

        if (container.categories && container.categories.length > 0) {
            result.categories = container.categories.map(category => this.owner.toObject(category));
        }

        if (container.sources && container.sources.length > 0) {
            result.sources = container.sources.map(source =>
                this.owner.toObject(
                    new SourceReferenceWrapper({
                        fileName: source.fileName,
                        line: source.line,
                        character: source.character
                    })
                )
            );
        }

        return result;
    }
}
