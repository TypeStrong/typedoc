import {Component, RendererComponent} from "../../utils/component";
import {Renderer} from "../Renderer";
import {OutputPageEvent} from "../events/OutputPageEvent";


/**
 * A plugin that wraps the generated output with a layout template.
 *
 * Currently only a default layout is supported. The layout must be stored
 * as ´layouts/default.hbs´ in the theme directory.
 */
@Component("layout")
export class LayoutPlugin extends RendererComponent
{
    /**
     * Create a new LayoutPlugin instance.
     */
    initialize() {
        this.listenTo(this.owner, {
            [Renderer.EVENT_END_PAGE]: this.onRendererEndPage
        });
    }


    /**
     * Triggered after a document has been rendered, just before it is written to disc.
     *
     * @param page  An event object describing the current render operation.
     */
    private onRendererEndPage(page:OutputPageEvent) {
        var layout = this.owner.getTemplate('layouts/default.hbs');
        page.contents = layout(page);
    }
}
