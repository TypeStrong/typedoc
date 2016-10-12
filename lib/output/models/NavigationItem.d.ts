import { Reflection } from "../../models/reflections/abstract";
export declare class NavigationItem {
    title: string;
    url: string;
    dedicatedUrls: string[];
    parent: NavigationItem;
    children: NavigationItem[];
    cssClasses: string;
    isLabel: boolean;
    isVisible: boolean;
    isCurrent: boolean;
    isGlobals: boolean;
    isInPath: boolean;
    constructor(title?: string, url?: string, parent?: NavigationItem, cssClasses?: string);
    static create(reflection: Reflection, parent?: NavigationItem, useShortNames?: boolean): NavigationItem;
}
