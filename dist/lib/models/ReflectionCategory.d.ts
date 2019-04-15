import { Reflection } from './reflections/abstract';
export declare class ReflectionCategory {
    title: string;
    children: Reflection[];
    allChildrenHaveOwnDocument: Function;
    constructor(title: string);
    private getAllChildrenHaveOwnDocument;
    toObject(): any;
}
