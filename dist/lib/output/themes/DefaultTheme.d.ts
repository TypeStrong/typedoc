import { Theme } from '../theme';
import { Renderer } from '../renderer';
import { Reflection, ReflectionKind, ProjectReflection, ContainerReflection, DeclarationReflection } from '../../models/reflections/index';
import { ReflectionGroup } from '../../models/ReflectionGroup';
import { UrlMapping } from '../models/UrlMapping';
import { NavigationItem } from '../models/NavigationItem';
export interface TemplateMapping {
    kind: ReflectionKind[];
    isLeaf: boolean;
    directory: string;
    template: string;
}
export declare class DefaultTheme extends Theme {
    static MAPPINGS: TemplateMapping[];
    static URL_PREFIX: RegExp;
    constructor(renderer: Renderer, basePath: string);
    isOutputDirectory(path: string): boolean;
    getUrls(project: ProjectReflection): UrlMapping[];
    getEntryPoint(project: ProjectReflection): ContainerReflection;
    getNavigation(project: ProjectReflection): NavigationItem;
    private onRendererBegin(event);
    static getUrl(reflection: Reflection, relative?: Reflection, separator?: string): string;
    static getMapping(reflection: DeclarationReflection): TemplateMapping;
    static buildUrls(reflection: DeclarationReflection, urls: UrlMapping[]): UrlMapping[];
    static applyAnchorUrl(reflection: Reflection, container: Reflection): void;
    static applyReflectionClasses(reflection: DeclarationReflection): void;
    static applyGroupClasses(group: ReflectionGroup): void;
    static toStyleClass(str: string): string;
}
