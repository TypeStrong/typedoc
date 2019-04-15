import { ContextAwareRendererComponent } from '../components';
import { MarkdownEvent, RendererEvent } from '../events';
export declare class MarkedLinksPlugin extends ContextAwareRendererComponent {
    private brackets;
    private inlineTag;
    listInvalidSymbolLinks: boolean;
    private warnings;
    initialize(): void;
    private replaceBrackets;
    private replaceInlineTags;
    private buildLink;
    onParseMarkdown(event: MarkdownEvent): void;
    onEndRenderer(event: RendererEvent): void;
    static splitLinkText(text: string): {
        caption: string;
        target: string;
    };
}
