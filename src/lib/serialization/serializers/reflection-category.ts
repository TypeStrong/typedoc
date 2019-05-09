import { ReflectionCategory } from '../../models/ReflectionCategory';

import { SerializerComponent } from '../components';
import { JSONOutput } from '../schema';

export class ReflectionCategorySerializer extends SerializerComponent<ReflectionCategory> {
    static PRIORITY = 1000;

    /**
     * Filter for instances of [[ReflectionCategory]]
     */
    serializeGroup(instance: any): boolean {
        return instance instanceof ReflectionCategory;
    }

    supports(r: unknown) {
        return r instanceof ReflectionCategory;
    }

    toObject(category: ReflectionCategory, obj?: Partial<JSONOutput.ReflectionCategory>): JSONOutput.ReflectionCategory {
        const result: JSONOutput.ReflectionCategory = {
            ...obj,
            title: category.title
        };

        if (category.children && category.children.length > 0) {
            result.children = category.children.map(child => child.id);
        }

        return result;
    }
}
