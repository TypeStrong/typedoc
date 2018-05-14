import * as FS from 'fs';
import * as Path from 'path';

import { DefaultTheme } from './DefaultTheme';
import { Renderer } from '../renderer';
import { UrlMapping } from '../models/UrlMapping';
import { Reflection, DeclarationReflection, ProjectReflection } from '../../models/reflections/index';
import { PageEvent } from '../events';
import { NavigationItem } from '../models/NavigationItem';

export class MinimalTheme extends DefaultTheme {
    /**
     * Create a new DefaultTheme instance.
     *
     * @param renderer  The renderer this theme is attached to.
     * @param basePath  The base path of this theme.
     */
    constructor(renderer: Renderer, basePath: string) {
        super(renderer, basePath);

        renderer.removeComponent('assets');
        renderer.removeComponent('javascriptIndex');
        renderer.removeComponent('navigation');
        renderer.removeComponent('toc');

        this.listenTo(renderer, PageEvent.BEGIN, this.onRendererBeginPage);
    }

    /**
     * Test whether the given path contains a documentation generated by this theme.
     *
     * @param path  The path of the directory that should be tested.
     * @returns     TRUE if the given path seems to be a previous output directory,
     *              otherwise FALSE.
     */
    isOutputDirectory(path: string): boolean {
        if (!FS.existsSync(Path.join(path, 'index.html'))) {
            return false;
        }
        return true;
    }

    /**
     * Map the models of the given project to the desired output files.
     *
     * @param project  The project whose urls should be generated.
     * @returns        A list of [[UrlMapping]] instances defining which models
     *                 should be rendered to which files.
     */
    getUrls(project: ProjectReflection): UrlMapping[] {
        const urls: UrlMapping[] = [];
        urls.push(new UrlMapping('index.html', project, 'index.hbs'));

        project.url = 'index.html';
        project.anchor = null;
        project.hasOwnDocument = true;

        project.children.forEach((child) => {
            DefaultTheme.applyAnchorUrl(child, project);
        });

        if (project.readmePages) {
            project.readmePages.updatePaths((readme) => {
                return readme.path + '.html';
            });

            // Since the primary readme is rendered in index we have to update
            // it's URL.
            project.readmePages.updatePath(project.readmePages.getRoot(), 'index.html');

            project.readmePages.getDefinitions().forEach((readme) => {
                if (readme.isRoot) {
                    return;
                }

                urls.push(new UrlMapping(readme.path, readme, 'readme.hbs'));
            });

            // For backward compatibility.
            project.readme = project.readmePages.getRoot().content;
        }

        return urls;
    }

    /**
     * Triggered before a document will be rendered.
     *
     * @param page  An event object describing the current render operation.
     */
    private onRendererBeginPage(page: PageEvent) {
        const model = page.model;
        if (!(model instanceof Reflection)) {
            return;
        }

        page.toc = new NavigationItem();
        MinimalTheme.buildToc(page.model, page.toc);
    }

    /**
     * Create a toc navigation item structure.
     *
     * @param model   The models whose children should be written to the toc.
     * @param parent  The parent [[Models.NavigationItem]] the toc should be appended to.
     */
    static buildToc(model: DeclarationReflection, parent: NavigationItem) {
        const children = model.children || [];
        children.forEach((child: DeclarationReflection) => {
            const item = NavigationItem.create(child, parent, true);
            MinimalTheme.buildToc(child, item);
        });
    }
}
