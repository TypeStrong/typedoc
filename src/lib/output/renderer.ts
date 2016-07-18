/**
 * Holds all logic used render and output the final documentation.
 *
 * The [[Renderer]] class is the central controller within this namespace. When invoked it creates
 * an instance of [[BaseTheme]] which defines the layout of the documentation and fires a
 * series of [[RendererEvent]] events. Instances of [[BasePlugin]] can listen to these events and
 * alter the generated output.
 */

import * as Path from "path";
import * as FS from "fs-extra";
import * as Handlebars from "handlebars";
var ProgressBar = require("progress");

import {Application} from "../application";
import {Theme} from "./theme";
import {RendererEvent, PageEvent} from "./events";
import {ProjectReflection} from "../models/reflections/project";
import {UrlMapping} from "./models/UrlMapping";
import {writeFile} from "../utils/fs";
import {DefaultTheme} from "./themes/DefaultTheme";
import {RendererComponent} from "./components";
import {Component, ChildableComponent, Option} from "../utils/component";
import {ParameterType} from "../utils/options/declaration";


/**
 * The renderer processes a [[ProjectReflection]] using a [[BaseTheme]] instance and writes
 * the emitted html documents to a output directory. You can specify which theme should be used
 * using the ```--theme <name>``` commandline argument.
 *
 * Subclasses of [[BasePlugin]] that have registered themselves in the [[Renderer.PLUGIN_CLASSES]]
 * will be automatically initialized. Most of the core functionality is provided as separate plugins.
 *
 * [[Renderer]] is a subclass of [[EventDispatcher]] and triggers a series of events while
 * a project is being processed. You can listen to these events to control the flow or manipulate
 * the output.
 *
 *  * [[Renderer.EVENT_BEGIN]]<br>
 *    Triggered before the renderer starts rendering a project. The listener receives
 *    an instance of [[RendererEvent]]. By calling [[RendererEvent.preventDefault]] the entire
 *    render process can be canceled.
 *
 *    * [[Renderer.EVENT_BEGIN_PAGE]]<br>
 *      Triggered before a document will be rendered. The listener receives an instance of
 *      [[PageEvent]]. By calling [[PageEvent.preventDefault]] the generation of the
 *      document can be canceled.
 *
 *    * [[Renderer.EVENT_END_PAGE]]<br>
 *      Triggered after a document has been rendered, just before it is written to disc. The
 *      listener receives an instance of [[PageEvent]]. When calling
 *      [[PageEvent.preventDefault]] the the document will not be saved to disc.
 *
 *  * [[Renderer.EVENT_END]]<br>
 *    Triggered after the renderer has written all documents. The listener receives
 *    an instance of [[RendererEvent]].
 */
@Component({name:"renderer", internal:true, childClass:RendererComponent})
export class Renderer extends ChildableComponent<Application, RendererComponent>
{
    /**
     * The theme that is used to render the documentation.
     */
    theme:Theme;

    @Option({
        name: 'theme',
        help: 'Specify the path to the theme that should be used or \'default\' or \'minimal\' to use built-in themes.',
        type: ParameterType.String,
        defaultValue: 'default'
    })
    themeName:string;

    @Option({
        name: 'disableOutputCheck',
        help: 'Should TypeDoc disable the testing and cleaning of the output directory?',
        type: ParameterType.Boolean
    })
    disableOutputCheck:boolean;

    @Option({
        name: 'gaID',
        help: 'Set the Google Analytics tracking ID and activate tracking code.'
    })
    gaID:string;

    @Option({
        name: 'gaSite',
        help: 'Set the site name for Google Analytics. Defaults to `auto`.',
        defaultValue: 'auto'
    })
    gaSite:string;

    @Option({
        name: 'hideGenerator',
        help: 'Do not print the TypeDoc link at the end of the page.',
        type: ParameterType.Boolean
    })
    hideGenerator:boolean;

    @Option({
        name: 'entryPoint',
        help: 'Specifies the fully qualified name of the root symbol. Defaults to global namespace.',
        type: ParameterType.String
    })
    entryPoint:string;

    /**
     * Create a new Renderer instance.
     *
     * @param application  The application this dispatcher is attached to.
     */
    initialize() {
    }


    /**
     * Render the given project reflection to the specified output directory.
     *
     * @param project  The project that should be rendered.
     * @param outputDirectory  The path of the directory the documentation should be rendered to.
     */
    render(project:ProjectReflection, outputDirectory:string) {
        if (!this.prepareTheme() || !this.prepareOutputDirectory(outputDirectory)) {
            return;
        }

        var output = new RendererEvent(RendererEvent.BEGIN);
        output.outputDirectory = outputDirectory;
        output.project = project;
        output.settings = this.application.options.getRawValues();
        output.urls = this.theme.getUrls(project);

        var bar = new ProgressBar('Rendering [:bar] :percent', {
            total: output.urls.length,
            width: 40
        });

        this.trigger(output);
        if (!output.isDefaultPrevented) {
            output.urls.forEach((mapping:UrlMapping) => {
                this.renderDocument(output.createPageEvent(mapping));
                bar.tick();
            });

            this.trigger(RendererEvent.END, output);
        }
    }


    /**
     * Render a single page.
     *
     * @param page An event describing the current page.
     * @return TRUE if the page has been saved to disc, otherwise FALSE.
     */
    private renderDocument(page:PageEvent):boolean {
        this.trigger(PageEvent.BEGIN, page);
        if (page.isDefaultPrevented) {
            return false;
        }

        page.template = page.template || this.theme.resources.templates.getResource(page.templateName).getTemplate();
        page.contents = page.template(page);

        this.trigger(PageEvent.END, page);
        if (page.isDefaultPrevented) {
            return false;
        }

        try {
            writeFile(page.filename, page.contents, false);
        } catch (error) {
            this.application.logger.error('Could not write %s', page.filename);
            return false;
        }

        return true;
    }


    /**
     * Ensure that a theme has been setup.
     *
     * If a the user has set a theme we try to find and load it. If no theme has
     * been specified we load the default theme.
     *
     * @returns TRUE if a theme has been setup, otherwise FALSE.
     */
    private prepareTheme():boolean {
        if (!this.theme) {
            var themeName = this.themeName;
            var path = Path.resolve(themeName);
            if (!FS.existsSync(path)) {
                path = Path.join(Renderer.getThemeDirectory(), themeName);
                if (!FS.existsSync(path)) {
                    this.application.logger.error('The theme %s could not be found.', themeName);
                    return false;
                }
            }

            this.theme = this.addComponent("theme", new DefaultTheme(this, path));
        }

        this.theme.resources.activate();
        return true;
    }


    /**
     * Prepare the output directory. If the directory does not exist, it will be
     * created. If the directory exists, it will be emptied.
     *
     * @param directory  The path to the directory that should be prepared.
     * @returns TRUE if the directory could be prepared, otherwise FALSE.
     */
    private prepareOutputDirectory(directory:string):boolean {
        if (FS.existsSync(directory)) {
            if (!FS.statSync(directory).isDirectory()) {
                this.application.logger.error(
                    'The output target "%s" exists but it is not a directory.',
                    directory);
                return false;
            }

            if (this.disableOutputCheck) {
                return true;
            }

            if (FS.readdirSync(directory).length == 0) {
                return true;
            }

            if (!this.theme.isOutputDirectory(directory)) {
                this.application.logger.error(
                    'The output directory "%s" exists but does not seem to be a documentation generated by TypeDoc.\n' +
                    'Make sure this is the right target directory, delete the folder and rerun TypeDoc.',
                    directory);
                return false;
            }

            try {
                FS.removeSync(directory);
            } catch (error) {
                this.application.logger.warn('Could not empty the output directory.');
            }
        }

        if (!FS.existsSync(directory)) {
            try {
                FS.mkdirpSync(directory);
            } catch (error) {
                this.application.logger.error('Could not create output directory %s', directory);
                return false;
            }
        }

        return true;
    }


    /**
     * Return the path containing the themes shipped with TypeDoc.
     *
     * @returns The path to the theme directory.
     */
    static getThemeDirectory():string {
        return Path.dirname(require.resolve('typedoc-default-themes'));
    }


    /**
     * Return the path to the default theme.
     *
     * @returns The path to the default theme.
     */
    static getDefaultTheme():string {
        return Path.join(Renderer.getThemeDirectory(), 'default');
    }
}


import "./plugins";
