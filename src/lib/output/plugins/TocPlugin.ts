import { Reflection, ReflectionKind, ProjectReflection, DeclarationReflection } from '../../models/reflections/index';
import { Component, RendererComponent } from '../components';
import { PageEvent } from '../events';
import { NavigationItem } from '../models/NavigationItem';

/**
 * A plugin that generates a table of contents for the current page.
 *
 * The table of contents will start at the nearest module or dynamic module. This plugin
 * sets the [[PageEvent.toc]] property.
 */
@Component({name: 'toc'})
export class TocPlugin extends RendererComponent {
    /**
     * Create a new TocPlugin instance.
     */
    initialize() {
        this.listenTo(this.owner, {
            [PageEvent.BEGIN]: this.onRendererBeginPage
        });
    }

    /**
     * Triggered before a document will be rendered.
     *
     * @param page  An event object describing the current render operation.
     */
    private onRendererBeginPage(page: PageEvent) {
        let model = page.model;
        if (!(model instanceof Reflection)) {
            return;
        }

        const trail: Reflection[] = [];
        while (!(model instanceof ProjectReflection) && !model.kindOf(ReflectionKind.SomeModule)) {
            trail.unshift(model);
            model = model.parent;
        }

        const tocRestriction = this.owner.toc;
        page.toc = new NavigationItem();
        TocPlugin.buildToc(model, trail, page.toc, tocRestriction);
    }

    /**
     * Create a toc navigation item structure.
     *
     * @param model   The models whose children should be written to the toc.
     * @param trail   Defines the active trail of expanded toc entries.
     * @param parent  The parent [[NavigationItem]] the toc should be appended to.
     * @param restriction  The restricted table of contents.
     */
    static buildToc(model: Reflection, trail: Reflection[], parent: NavigationItem, restriction?: string[]) {
        const index = trail.indexOf(model);
        const children = model['children'] || [];

        if (index < trail.length - 1 && children.length > 40) {
            const child = trail[index + 1];
            const item = NavigationItem.create(child, parent, true);
            item.isInPath  = true;
            item.isCurrent = false;
            TocPlugin.buildToc(child, trail, item);
        } else {
            children.forEach((child: DeclarationReflection) => {

                if (restriction && restriction.length > 0 && !restriction.includes(child.name)) {
                    return;
                }

                if (child.kindOf(ReflectionKind.SomeModule)) {
                    return;
                }

                const item = NavigationItem.create(child, parent, true);
                if (trail.includes(child)) {
                    item.isInPath  = true;
                    item.isCurrent = (trail[trail.length - 1] === child);
                    TocPlugin.buildToc(child, trail, item);
                }
            });
        }
    }
}
