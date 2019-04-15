import { Renderer } from './renderer';
import { ProjectReflection } from '../models/reflections/project';
import { UrlMapping } from './models/UrlMapping';
import { NavigationItem } from './models/NavigationItem';
import { RendererComponent } from './components';
import { Resources } from './utils/resources';
export declare abstract class Theme extends RendererComponent {
    basePath: string;
    resources: Resources;
    constructor(renderer: Renderer, basePath: string);
    abstract isOutputDirectory(path: string): boolean;
    abstract getUrls(project: ProjectReflection): UrlMapping[];
    abstract getNavigation(project: ProjectReflection): NavigationItem;
}
