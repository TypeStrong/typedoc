import { DefaultTheme } from "./DefaultTheme";
import { Renderer } from "../renderer";
import { UrlMapping } from "../models/UrlMapping";
import { DeclarationReflection, ProjectReflection } from "../../models/reflections/index";
import { NavigationItem } from "../models/NavigationItem";
export declare class MinimalTheme extends DefaultTheme {
    constructor(renderer: Renderer, basePath: string);
    isOutputDirectory(path: string): boolean;
    getUrls(project: ProjectReflection): UrlMapping[];
    private onRendererBeginPage(page);
    static buildToc(model: DeclarationReflection, parent: NavigationItem): void;
}
