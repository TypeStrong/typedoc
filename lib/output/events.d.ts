import { Event } from "../utils/events";
import { ProjectReflection } from "../models/reflections/project";
import { UrlMapping } from "./models/UrlMapping";
import { NavigationItem } from "./models/NavigationItem";
export declare class RendererEvent extends Event {
    project: ProjectReflection;
    settings: any;
    outputDirectory: string;
    urls: UrlMapping[];
    static BEGIN: string;
    static END: string;
    createPageEvent(mapping: UrlMapping): PageEvent;
}
export declare class PageEvent extends Event {
    project: ProjectReflection;
    settings: any;
    filename: string;
    url: string;
    model: any;
    template: HandlebarsTemplateDelegate;
    templateName: string;
    navigation: NavigationItem;
    toc: NavigationItem;
    contents: string;
    static BEGIN: string;
    static END: string;
}
export declare class MarkdownEvent extends Event {
    originalText: string;
    parsedText: string;
    static PARSE: string;
}
