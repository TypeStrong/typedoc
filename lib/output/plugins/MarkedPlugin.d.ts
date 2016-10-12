import { ContextAwareRendererComponent } from "../components";
import { RendererEvent, MarkdownEvent } from "../events";
export declare class MarkedPlugin extends ContextAwareRendererComponent {
    includeSource: string;
    mediaSource: string;
    private includes;
    private mediaDirectory;
    private includePattern;
    private mediaPattern;
    initialize(): void;
    getHighlighted(text: string, lang?: string): string;
    parseMarkdown(text: string, context: any): string;
    protected onBeginRenderer(event: RendererEvent): void;
    onParseMarkdown(event: MarkdownEvent): void;
}
