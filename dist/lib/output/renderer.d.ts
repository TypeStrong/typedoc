import { Application } from '../application';
import { Theme } from './theme';
import { ProjectReflection } from '../models/reflections/project';
import { RendererComponent } from './components';
import { ChildableComponent } from '../utils/component';
export declare class Renderer extends ChildableComponent<Application, RendererComponent> {
    theme?: Theme;
    themeName: string;
    disableOutputCheck: boolean;
    gaID: string;
    gaSite: string;
    hideGenerator: boolean;
    entryPoint: string;
    toc: string[];
    initialize(): void;
    render(project: ProjectReflection, outputDirectory: string): void;
    private renderDocument;
    private prepareTheme;
    private prepareOutputDirectory;
    static getThemeDirectory(): string;
    static getDefaultTheme(): string;
}
import './plugins';
