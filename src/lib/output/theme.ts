import type { Renderer } from "./renderer.js";
import { RendererComponent } from "./components.js";
import type { PageEvent } from "./events.js";
import type { Reflection } from "../models/index.js";

/**
 * Base class of all themes.
 *
 * The theme class determines how a page is rendered. It is loosely coupled with a router
 * class instance which is also created by the {@link Renderer} class.
 */
export abstract class Theme extends RendererComponent {
    /**
     * Renders the provided page to a string, which will be written to disk by the {@link Renderer}
     */
    abstract render(event: PageEvent<Reflection>): string;
}
