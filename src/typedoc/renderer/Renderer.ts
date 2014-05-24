module TypeDoc.Renderer
{
    export interface IHandlebarTemplate {
        (context?: any, options?: any):string;
    }

    export class Renderer extends EventDispatcher
    {
        application:Application;

        plugins:BasePlugin[];

        theme:BaseTheme;

        ioHost:TypeScript.IIO;

        dirName:string;

        private templates:{[path:string]:IHandlebarTemplate} = {};

        static PLUGIN_CLASSES:any[] = [];


        constructor(application:Application) {
            super();
            this.application = application;
            this.ioHost      = application.ioHost;

            this.plugins = [];
            Renderer.PLUGIN_CLASSES.forEach((pluginClass) => {
                this.plugins.push(new pluginClass(this));
            });

            Marked.setOptions({
                highlight: (code:string) => HighlightJS.highlightAuto(code).value
            });

            Handlebars.registerHelper('compact', function(options) {
                var lines = options.fn(this).split('\n');
                for (var i = 0, c = lines.length; i < c; i++) {
                    lines[i] = lines[i].trim().replace(/&nbsp;/, ' ');
                }
                return lines.join('');
            });

            Handlebars.registerHelper('markdown', function(options) {
                return Marked(options.fn(this));
            });
        }


        setTheme(dirname:string) {
            dirname = this.ioHost.resolvePath(dirname);
            if (!this.ioHost.fileExists(dirname)) {
                throw new Error('Theme directory ´' + dirname + '´ does not exist.');
            }

            var filename = TypeScript.IOUtils.combine(dirname, 'theme.js');
            if (!this.ioHost.fileExists(filename)) {
                throw new Error('Theme theme.js ´' + filename + '´ does not exist.');
            }

            var themeClass = eval(readFile(filename));
            this.theme = new themeClass(this, this.application.project, dirname);
        }


        getDefaultTheme() {
            var compilerFilePath = this.application.ioHost.getExecutingFilePath();
            var containingDirectoryPath = this.application.ioHost.dirName(compilerFilePath);
            var libraryFilePath = this.application.resolvePath(TypeScript.IOUtils.combine(TypeScript.IOUtils.combine(containingDirectoryPath, 'themes'), 'default'));

            return libraryFilePath;
        }


        getTemplate(fileName:string):IHandlebarTemplate {
            if (!this.theme) {
                throw new Error('Cannot resolve templates before theme is set.');
            }

            if (!this.templates[fileName]) {
                var absFileName = TypeScript.IOUtils.combine(this.theme.basePath, fileName);
                absFileName = this.ioHost.resolvePath(absFileName);

                if (!this.ioHost.fileExists(absFileName)) {
                    throw new Error('Cannot find template ´' + absFileName + '´.');
                }

                this.templates[fileName] = Handlebars.compile(readFile(absFileName));
            }

            return this.templates[fileName];
        }


        render() {
            if (!this.theme) {
                this.setTheme(this.getDefaultTheme());
            }

            if (FS.existsSync(this.dirName)) {
                if (this.theme.isOutputDirectory(this.dirName)) {
                    FS.rmrfSync(this.dirName);
                    FS.mkdirpSync(this.dirName);
                }
            } else {
                FS.mkdirRecursiveSync(this.dirName);
            }

            var target     = new Models.RenderTarget();
            target.dirname = this.dirName;
            target.project = this.application.project;
            target.urls    = this.theme.getUrls();

            this.dispatch('beginTarget', target);
            if (target.isDefaultPrevented) return;

            this.renderTarget(target);

            this.dispatch('endTarget', target);
        }


        private renderTarget(target:Models.RenderTarget) {
            target.urls.forEach((mapping:Models.UrlMapping) => {
                var output          = new Models.RenderOutput(target);
                output.url          = mapping.url;
                output.model        = mapping.model;
                output.templateName = mapping.template;
                output.template     = this.getTemplate(Path.join('templates', mapping.template));
                output.filename     = Path.join(target.dirname, mapping.url);

                this.dispatch('beginOutput', output);
                if (output.isDefaultPrevented || !output.template) return;

                output.contents = output.template(output);

                this.dispatch('endOutput', output);
                if (output.isDefaultPrevented) return;

                TypeScript.IOUtils.writeFileAndFolderStructure(this.application.ioHost, output.filename, output.contents, true);
            });
        }
    }
}