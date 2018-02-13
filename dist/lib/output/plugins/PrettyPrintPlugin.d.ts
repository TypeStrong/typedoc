import { RendererComponent } from '../components';
import { PageEvent } from '../events';
export declare class PrettyPrintPlugin extends RendererComponent {
    static IGNORED_TAGS: any;
    static PRE_TAGS: any;
    initialize(): void;
    onRendererEndPage(event: PageEvent): void;
}
