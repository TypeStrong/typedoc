import { Application } from '../application';
import { AbstractComponent } from './component';
export declare class PluginHost extends AbstractComponent<Application> {
    plugins: string[];
    load(): boolean;
    private discoverNpmPlugins;
}
