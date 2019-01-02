import { Component } from '../../utils/component';
import { ReflectionGroup } from '../../models/ReflectionGroup';

import { SerializerComponent } from '../components';
import { JSONOutput } from '../schema';

@Component({ name: 'serializer:reflection-group' })
export class ReflectionGroupSerializer extends SerializerComponent<ReflectionGroup> {
    static PRIORITY = 1000;

    /**
     * Filter for instances of [[ReflectionGroup]]
     */
    serializeGroup(instance: any): boolean {
        return instance instanceof ReflectionGroup;
    }

    supports(r: unknown) {
        return true;
    }

    toObject(group: ReflectionGroup, obj?: Partial<JSONOutput.ReflectionGroup>): JSONOutput.ReflectionGroup {
        const result: JSONOutput.ReflectionGroup = {
            ...obj,
            title: group.title,
            kind: group.kind
        };

        if (group.children && group.children.length > 0) {
            result.children = group.children.map(child => child.id);
        }

        return result;
    }
}
