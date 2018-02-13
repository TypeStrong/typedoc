import { Reflection, ReflectionKind } from './reflections/abstract';
export declare class ReflectionGroup {
    title: string;
    kind: ReflectionKind;
    children: Reflection[];
    cssClasses: string;
    allChildrenHaveOwnDocument: Function;
    allChildrenAreInherited: boolean;
    allChildrenArePrivate: boolean;
    allChildrenAreProtectedOrPrivate: boolean;
    allChildrenAreExternal: boolean;
    someChildrenAreExported: boolean;
    constructor(title: string, kind: ReflectionKind);
    private getAllChildrenHaveOwnDocument();
    toObject(): any;
}
