import { Reflection } from '../../models/reflections/index';
import { RendererComponent } from '../components';
import { NavigationItem } from '../models/NavigationItem';
export declare class TocPlugin extends RendererComponent {
    initialize(): void;
    private onRendererBeginPage;
    static buildToc(model: Reflection, trail: Reflection[], parent: NavigationItem, restriction?: string[]): void;
}
