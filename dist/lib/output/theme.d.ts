import { Renderer } from './renderer';
import { ProjectReflection } from '../models/reflections/project';
import { UrlMapping } from './models/UrlMapping';
import { NavigationItem } from './models/NavigationItem';
import { RendererComponent } from './components';
import { Resources } from './utils/resources';
export declare class Theme extends RendererComponent {
    basePath: string;
    resources: Resources;
    constructor(renderer: Renderer, basePath: string);
    isOutputDirectory(path: string): boolean;
    getUrls(project: ProjectReflection): UrlMapping[];
    getNavigation(project: ProjectReflection): NavigationItem;
}
