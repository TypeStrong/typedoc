import { ProjectReflection } from "../models/reflections/index";
export declare class LinkParser {
    private project;
    private inlineTag;
    private urlPrefix;
    private linkPrefix;
    constructor(project: ProjectReflection, linkPrefix?: string);
    private replaceInlineTags(text);
    private buildLink(original, target, caption, monospace?);
    parseMarkdown(text: string): string;
    private splitLinkText(text);
}
