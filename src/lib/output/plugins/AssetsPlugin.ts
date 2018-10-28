import * as Path from 'path';
import * as FS from 'fs-extra';

import { Component, RendererComponent } from '../components';
import { RendererEvent } from '../events';
import { Renderer } from '../renderer';

/**
 * A plugin that copies the subdirectory ´assets´ from the current themes
 * source folder to the output directory.
 */
@Component({name: 'assets'})
export class AssetsPlugin extends RendererComponent {
    /**
     * Should the default assets always be copied to the output directory?
     */
    copyDefaultAssets = true;

    /**
     * Create a new AssetsPlugin instance.
     */
    initialize() {
        this.listenTo(this.owner, {
            [RendererEvent.BEGIN]: this.onRendererBegin
        });
    }

    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    private onRendererBegin(event: RendererEvent) {
        let fromDefault: string | undefined = Path.join(Renderer.getDefaultTheme(), 'assets');
        const to = Path.join(event.outputDirectory, 'assets');

        if (this.copyDefaultAssets) {
            FS.copySync(fromDefault, to);
        } else {
            fromDefault = undefined;
        }

        const from = Path.join(this.owner.theme!.basePath, 'assets');
        if (from !== fromDefault && FS.existsSync(from)) {
            FS.copySync(from, to);
        }
    }
}
