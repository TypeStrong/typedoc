import { Component } from '../../utils/component';
import { ReflectionGroup } from '../../models/ReflectionGroup';

import { SerializerComponent } from '../components';

@Component({ name: 'serializer:reflection-group' })
export class ReflectionGroupSerializer extends SerializerComponent<ReflectionGroup> {
    static PRIORITY = 1000;

    /**
     * Filter for instances of [[ReflectionGroup]]
     */
    serializeGroup(instance: any): boolean {
        return instance instanceof ReflectionGroup;
    }

    initialize(): void {
        super.initialize();
    }

    supports(r: unknown) {
        return r instanceof ReflectionGroup;
    }

    toObject(group: ReflectionGroup, obj?: any): any {
        obj = obj || {};

        Object.assign(obj, {
            title: group.title,
            kind: group.kind
        });

        if (group.children && group.children.length > 0) {
            obj.children = group.children.map(child => child.id);
        }

        return obj;
    }
}
