import {Component, RendererComponent} from "../components";
import {PageEvent} from "../events";


/**
 * A plugin that wraps the generated output with a layout template.
 *
 * Currently only a default layout is supported. The layout must be stored
 * as ´layouts/default.hbs´ in the theme directory.
 */
@Component({name:"layout"})
export class LayoutPlugin extends RendererComponent
{
    /**
     * Create a new LayoutPlugin instance.
     */
    initialize() {
        this.listenTo(this.owner, PageEvent.END, this.onRendererEndPage);
    }


    /**
     * Triggered after a document has been rendered, just before it is written to disc.
     *
     * @param page  An event object describing the current render operation.
     */
    private onRendererEndPage(page:PageEvent) {
        var layout = this.owner.theme.resources.layouts.getResource('default').getTemplate();
        page.contents = layout(page);
    }
}
