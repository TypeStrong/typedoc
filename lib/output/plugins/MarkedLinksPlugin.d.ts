import { ContextAwareRendererComponent } from "../components";
import { MarkdownEvent } from "../events";
export declare class MarkedLinksPlugin extends ContextAwareRendererComponent {
    private brackets;
    private inlineTag;
    private urlPrefix;
    initialize(): void;
    private replaceBrackets(text);
    private replaceInlineTags(text);
    private buildLink(original, target, caption, monospace?);
    onParseMarkdown(event: MarkdownEvent): void;
    static splitLinkText(text: string): {
        caption: string;
        target: string;
    };
}
