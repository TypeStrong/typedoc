import { RendererComponent } from '../components';
import { NavigationItem } from '../models/NavigationItem';
export declare class NavigationPlugin extends RendererComponent {
    navigation: NavigationItem;
    initialize(): void;
    private onBeginRenderer;
    private onBeginPage;
}
