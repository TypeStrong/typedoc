import { RendererComponent } from '../components';
import { PageEvent } from '../events';
export declare class PrettyPrintPlugin extends RendererComponent {
    static IGNORED_TAGS: {
        area: boolean;
        base: boolean;
        br: boolean;
        wbr: boolean;
        col: boolean;
        command: boolean;
        embed: boolean;
        hr: boolean;
        img: boolean;
        input: boolean;
        link: boolean;
        meta: boolean;
        param: boolean;
        source: boolean;
    };
    static PRE_TAGS: {
        pre: boolean;
        code: boolean;
        textarea: boolean;
        script: boolean;
        style: boolean;
    };
    initialize(): void;
    onRendererEndPage(event: PageEvent): void;
}
