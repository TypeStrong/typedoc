/**
 * Holds all logic used render and output the final documentation.
 *
 * The [[Renderer]] class is the central controller within this namespace. When invoked it creates
 * an instance of [[BaseTheme]] which defines the layout of the documentation and fires a
 * series of [[OutputEvent]] events. Instances of [[BasePlugin]] can listen to these events and
 * alter the generated output.
 */
module td
{
    /**
     * Interface representation of a handlebars template.
     */
    export interface IHandlebarTemplate {
        (context?: any, options?: any):string;
    }


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
     *    an instance of [[OutputEvent]]. By calling [[OutputEvent.preventDefault]] the entire
     *    render process can be canceled.
     *
     *    * [[Renderer.EVENT_BEGIN_PAGE]]<br>
     *      Triggered before a document will be rendered. The listener receives an instance of
     *      [[OutputPageEvent]]. By calling [[OutputPageEvent.preventDefault]] the generation of the
     *      document can be canceled.
     *
     *    * [[Renderer.EVENT_END_PAGE]]<br>
     *      Triggered after a document has been rendered, just before it is written to disc. The
     *      listener receives an instance of [[OutputPageEvent]]. When calling
     *      [[OutputPageEvent.preventDefault]] the the document will not be saved to disc.
     *
     *  * [[Renderer.EVENT_END]]<br>
     *    Triggered after the renderer has written all documents. The listener receives
     *    an instance of [[OutputEvent]].
     */
    export class Renderer extends EventDispatcher
    {
        /**
         * The application this dispatcher is attached to.
         */
        application:IApplication;

        /**
         * List of all plugins that are attached to the renderer.
         */
        plugins:RendererPlugin[];

        /**
         * The theme that is used to render the documentation.
         */
        theme:BaseTheme;

        /**
         * Hash map of all loaded templates indexed by filename.
         */
        private templates:{[path:string]:IHandlebarTemplate} = {};

        /**
         * Triggered before the renderer starts rendering a project.
         * @event
         */
        static EVENT_BEGIN:string = 'beginRender';

        /**
         * Triggered after the renderer has written all documents.
         * @event
         */
        static EVENT_END:string = 'endRender';

        /**
         * Triggered before a document will be rendered.
         * @event
         */
        static EVENT_BEGIN_PAGE:string = 'beginPage';

        /**
         * Triggered after a document has been rendered, just before it is written to disc.
         * @event
         */
        static EVENT_END_PAGE:string = 'endPage';

        /**
         * Registry containing the plugins, that should be created by default.
         */
        static PLUGIN_CLASSES:any[] = [];



        /**
         * Create a new Renderer instance.
         *
         * @param application  The application this dispatcher is attached to.
         */
        constructor(application:IApplication) {
            super();
            this.application = application;

            this.plugins = [];
            Renderer.PLUGIN_CLASSES.forEach((pluginClass) => {
                this.addPlugin(pluginClass);
            });
        }


        /**
         * Add a plugin to the renderer.
         *
         * @param pluginClass  The class of the plugin that should be attached.
         */
        addPlugin(pluginClass:typeof RendererPlugin) {
            if (this.getPlugin(pluginClass) == null) {
                this.plugins.push(new pluginClass(this));
            }
        }


        /**
         * Remove a plugin from the renderer.
         *
         * @param pluginClass  The class of the plugin that should be detached.
         */
        removePlugin(pluginClass:typeof RendererPlugin) {
            for (var i = 0, c = this.plugins.length; i < c; i++) {
                if (this.plugins[i] instanceof pluginClass) {
                    this.plugins[i].remove();
                    this.plugins.splice(i, 1);
                    c -= 1;
                }
            }
        }


        /**
         * Retrieve a plugin instance.
         *
         * @param pluginClass  The class of the plugin that should be retrieved.
         * @returns  The instance of the plugin or NULL if no plugin with the given class is attached.
         */
        getPlugin(pluginClass:typeof RendererPlugin):RendererPlugin {
            for (var i = 0, c = this.plugins.length; i < c; i++) {
                if (this.plugins[i] instanceof pluginClass) {
                    return this.plugins[i];
                }
            }

            return null;
        }



        /**
         * Return the template with the given filename.
         *
         * Tries to find the file in the ´templates´ subdirectory of the current theme.
         * If it does not exist, TypeDoc tries to find the template in the default
         * theme templates subdirectory.
         *
         * @param fileName  The filename of the template that should be loaded.
         * @returns The compiled template or NULL if the file could not be found.
         */
        public getTemplate(fileName:string):IHandlebarTemplate {
            if (!this.theme) {
                this.application.log(
                    Util.format('Cannot resolve templates before theme is set.'),
                    LogLevel.Error);
                return null;
            }

            if (!this.templates[fileName]) {
                var path = Path.resolve(Path.join(this.theme.basePath, fileName));
                if (!FS.existsSync(path)) {
                    path = Path.resolve(Path.join(Renderer.getDefaultTheme(), fileName));
                    if (!FS.existsSync(path)) {
                        this.application.log(
                            Util.format('Cannot find template %s', fileName),
                            LogLevel.Error);
                        return null;
                    }
                }

                this.templates[fileName] = Handlebars.compile(Renderer.readFile(path));
            }

            return this.templates[fileName];
        }


        /**
         * Render the given project reflection to the specified output directory.
         *
         * @param project  The project that should be rendered.
         * @param outputDirectory  The path of the directory the documentation should be rendered to.
         */
        render(project:ProjectReflection, outputDirectory:string) {
            this.application.log('Starting renderer', LogLevel.Verbose);

            if (!this.prepareTheme() || !this.prepareOutputDirectory(outputDirectory)) {
                return;
            }

            var output = new OutputEvent();
            output.outputDirectory = outputDirectory;
            output.project = project;
            output.settings = this.application.settings;
            output.urls = this.theme.getUrls(project);

            this.dispatch(Renderer.EVENT_BEGIN, output);
            if (!output.isDefaultPrevented) {
                output.urls.forEach((mapping:UrlMapping) => {
                    this.renderDocument(output.createPageEvent(mapping));
                });

                this.dispatch(Renderer.EVENT_END, output);
            }
        }


        /**
         * Render a single page.
         *
         * @param page An event describing the current page.
         * @return TRUE if the page has been saved to disc, otherwise FALSE.
         */
        private renderDocument(page:OutputPageEvent):boolean {
            this.application.log(Util.format('Render %s', page.url), LogLevel.Verbose);

            this.dispatch(Renderer.EVENT_BEGIN_PAGE, page);
            if (page.isDefaultPrevented) {
                return false;
            }

            page.template = page.template || this.getTemplate(Path.join('templates', page.templateName));
            page.contents = page.template(page);

            this.dispatch(Renderer.EVENT_END_PAGE, page);
            if (page.isDefaultPrevented) {
                return false;
            }

            try {
                writeFile(page.filename, page.contents, true);
            } catch (error) {
                this.application.log(Util.format('Error: Could not write %s', page.filename), LogLevel.Error);
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
                var themeName = this.application.settings.theme;
                var path = Path.resolve(themeName);
                if (!FS.existsSync(path)) {
                    path = Path.join(Renderer.getThemeDirectory(), themeName);
                    if (!FS.existsSync(path)) {
                        this.application.log(
                            Util.format('The theme %s could not be found.', themeName),
                            LogLevel.Error);
                        return false;
                    }
                }

                var filename = Path.join(path, 'theme.js');
                if (!FS.existsSync(filename)) {
                    this.theme = new DefaultTheme(this, path);
                } else {
                    var themeClass = eval(Renderer.readFile(filename));
                    this.theme = new themeClass(this, path);
                }
            }

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
                if (!this.theme.isOutputDirectory(directory)) {
                    this.application.log(Util.format(
                        'Error: The output directory "%s" exists but does not seem to be a documentation generated by TypeDoc.\n' +
                            'Make sure this is the right target directory, delete the folder and rerun TypeDoc.',
                        directory), LogLevel.Error);
                    return false;
                }

                try {
                    FS.rmrfSync(directory);
                } catch (error) {
                    this.application.log('Warning: Could not empty the output directory.', LogLevel.Warn);
                }
            }

            if (!FS.existsSync(directory)) {
                try {
                    FS.mkdirpSync(directory);
                } catch (error) {
                    this.application.log(Util.format(
                        'Error: Could not create output directory %s',
                        directory), LogLevel.Error);
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


        /**
         * Load the given file and return its contents.
         *
         * @param file  The path of the file to read.
         * @returns The files contents.
         */
        static readFile(file):string
        {
            var buffer = FS.readFileSync(file);
            switch (buffer[0]) {
                case 0xFE:
                    if (buffer[1] === 0xFF) {
                        var i = 0;
                        while ((i + 1) < buffer.length) {
                            var temp = buffer[i];
                            buffer[i] = buffer[i + 1];
                            buffer[i + 1] = temp;
                            i += 2;
                        }
                        return buffer.toString("ucs2", 2);
                    }
                    break;
                case 0xFF:
                    if (buffer[1] === 0xFE) {
                        return buffer.toString("ucs2", 2);
                    }
                    break;
                case 0xEF:
                    if (buffer[1] === 0xBB) {
                        return buffer.toString("utf8", 3);
                    }
            }

            return buffer.toString("utf8", 0);
        }
    }
}