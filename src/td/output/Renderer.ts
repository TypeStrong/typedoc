/**
 * Holds all logic used render and output the final documentation.
 *
 * The [[Renderer]] class is the central controller within this namespace. When invoked it creates
 * an instance of [[BaseTheme]] which defines the layout of the documentation and fires a
 * series of [[OutputEvent]] events. Instances of [[BasePlugin]] can listen to these events and
 * alter the generated output.
 */
module td.output
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
    export class Renderer extends PluginHost<RendererPlugin>
    {
        /**
         * The application this dispatcher is attached to.
         */
        application:IApplication;

        /**
         * The theme that is used to render the documentation.
         */
        theme:Theme;

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
         * Create a new Renderer instance.
         *
         * @param application  The application this dispatcher is attached to.
         */
        constructor(application:IApplication) {
            super();
            this.application = application;

            Renderer.loadPlugins(this);
        }


        getParameters():IParameter[] {
            var result = super.getParameters();

            this.prepareTheme();
            var theme:IParameterProvider = <any>this.theme;
            if (theme.getParameters) {
                result = result.concat(theme.getParameters());
            }

            return result;
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
                this.application.logger.error('Cannot resolve templates before theme is set.');
                return null;
            }

            if (!this.templates[fileName]) {
                var path = Path.resolve(Path.join(this.theme.basePath, fileName));
                if (!FS.existsSync(path)) {
                    path = Path.resolve(Path.join(Renderer.getDefaultTheme(), fileName));
                    if (!FS.existsSync(path)) {
                        this.application.logger.error('Cannot find template %s', fileName);
                        return null;
                    }
                }

                this.templates[fileName] = Handlebars.compile(Renderer.readFile(path), {
                    preventIndent: true
                });
            }

            return this.templates[fileName];
        }


        /**
         * Render the given project reflection to the specified output directory.
         *
         * @param project  The project that should be rendered.
         * @param outputDirectory  The path of the directory the documentation should be rendered to.
         */
        render(project:models.ProjectReflection, outputDirectory:string) {
            if (!this.prepareTheme() || !this.prepareOutputDirectory(outputDirectory)) {
                return;
            }

            var output = new OutputEvent();
            output.outputDirectory = outputDirectory;
            output.project = project;
            output.settings = this.application.options;
            output.urls = this.theme.getUrls(project);

            var bar = new ProgressBar('Rendering [:bar] :percent', {
                total: output.urls.length,
                width: 40
            });

            this.dispatch(Renderer.EVENT_BEGIN, output);
            if (!output.isDefaultPrevented) {
                output.urls.forEach((mapping:UrlMapping) => {
                    this.renderDocument(output.createPageEvent(mapping));
                    bar.tick();
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
                var themeName = this.application.options.theme;
                var path = Path.resolve(themeName);
                if (!FS.existsSync(path)) {
                    path = Path.join(Renderer.getThemeDirectory(), themeName);
                    if (!FS.existsSync(path)) {
                        this.application.logger.error('The theme %s could not be found.', themeName);
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
                if (!FS.statSync(directory).isDirectory()) {
                    this.application.logger.error(
                        'The output target "%s" exists but it is not a directory.',
                        directory);
                    return false;
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