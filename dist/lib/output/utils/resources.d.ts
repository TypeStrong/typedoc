import { Theme } from '../theme';
import { HelperStack } from './resources/helpers';
import { TemplateStack, PartialStack } from './resources/templates';
export declare class Resources {
    templates: TemplateStack;
    layouts: TemplateStack;
    partials: PartialStack;
    helpers: HelperStack;
    private theme;
    private isActive;
    constructor(theme: Theme);
    activate(): boolean;
    deactivate(): boolean;
    getTheme(): Theme;
    addDirectory(name: string, path: string): void;
    removeDirectory(name: string): void;
    removeAllDirectories(): void;
}
