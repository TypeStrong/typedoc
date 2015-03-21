module td.converter
{
    /**
     * Stores data of a repository.
     */
    class Repository
    {
        /**
         * The root path of this repository.
         */
        path:string;

        /**
         * The name of the branch this repository is on right now.
         */
        branch:string = 'master';

        /**
         * A list of all files tracked by the repository.
         */
        files:string[] = [];

        /**
         * The user/organisation name of this repository on GitHub.
         */
        gitHubUser:string;

        /**
         * The project name of this repository on GitHub.
         */
        gitHubProject:string;


        /**
         * Create a new Repository instance.
         *
         * @param path  The root path of the repository.
         */
        constructor(path:string) {
            this.path = path;
            ShellJS.pushd(path);

            var out = ShellJS.exec('git ls-remote --get-url', {silent:true});
            if (out.code == 0) {
                var url, remotes = out.output.split('\n');
                for (var i = 0, c = remotes.length; i < c; i++) {
                    url = /github\.com[:\/]([^\/]+)\/(.*)/.exec(remotes[i]);
                    if (url) {
                        this.gitHubUser = url[1];
                        this.gitHubProject = url[2];
                        if (this.gitHubProject.substr(-4) == '.git') {
                            this.gitHubProject = this.gitHubProject.substr(0, this.gitHubProject.length - 4);
                        }
                        break;
                    }
                }
            }

            out = ShellJS.exec('git ls-files', {silent:true});
            if (out.code == 0) {
                out.output.split('\n').forEach((file) => {
                    if (file != '') {
                        this.files.push(BasePath.normalize(path + '/' + file));
                    }
                });
            }

            out = ShellJS.exec('git rev-parse --abbrev-ref HEAD', {silent:true});
            if (out.code == 0) {
                this.branch = out.output.replace('\n', '');
            }

            ShellJS.popd();
        }


        /**
         * Check whether the given file is tracked by this repository.
         *
         * @param fileName  The name of the file to test for.
         * @returns TRUE when the file is part of the repository, otherwise FALSE.
         */
        contains(fileName:string):boolean {
            return this.files.indexOf(fileName) != -1;
        }


        /**
         * Get the URL of the given file on GitHub.
         *
         * @param fileName  The file whose GitHub URL should be determined.
         * @returns An url pointing to the web preview of the given file or NULL.
         */
        getGitHubURL(fileName:string):string {
            if (!this.gitHubUser || !this.gitHubProject || !this.contains(fileName)) {
                return null;
            }

            return [
                'https://github.com',
                this.gitHubUser,
                this.gitHubProject,
                'blob',
                this.branch,
                fileName.substr(this.path.length + 1)
            ].join('/');
        }


        /**
         * Try to create a new repository instance.
         *
         * Checks whether the given path is the root of a valid repository and if so
         * creates a new instance of [[Repository]].
         *
         * @param path  The potential repository root.
         * @returns A new instance of [[Repository]] or NULL.
         */
        static tryCreateRepository(path:string):Repository {
            var out, repository = null;

            ShellJS.pushd(path);
            out = ShellJS.exec('git rev-parse --show-toplevel', {silent:true});
            ShellJS.popd();

            if (out.code != 0) return null;
            return new Repository(BasePath.normalize(out.output.replace("\n", '')));
        }
    }


    /**
     * A handler that watches for repositories with GitHub origin and links
     * their source files to the related GitHub pages.
     */
    export class GitHubPlugin extends ConverterPlugin
    {
        /**
         * List of known repositories.
         */
        private repositories:{[path:string]:Repository} = {};

        /**
         * List of paths known to be not under git control.
         */
        private ignoredPaths:string[] = [];


        /**
         * Create a new GitHubHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter:Converter) {
            super(converter);

            ShellJS.config.silent = true;
            if (ShellJS.which('git')) {
                converter.on(Converter.EVENT_RESOLVE_END, this.onEndResolve, this);
            }
        }


        /**
         * Check whether the given file is placed inside a repository.
         *
         * @param fileName  The name of the file a repository should be looked for.
         * @returns The found repository info or NULL.
         */
        private getRepository(fileName:string):Repository {
            // Check for known non-repositories
            var dirName = Path.dirname(fileName);
            for (var i = 0, c = this.ignoredPaths.length; i < c; i++) {
                if (this.ignoredPaths[i] == dirName) {
                    return null;
                }
            }

            // Check for known repositories
            for (var path in this.repositories) {
                if (!this.repositories.hasOwnProperty(path)) continue;
                if (fileName.substr(0, path.length) == path) {
                    return this.repositories[path];
                }
            }

            // Try to create a new repository
            var repository = Repository.tryCreateRepository(dirName);
            if (repository) {
                this.repositories[repository.path] = repository;
                return repository;
            }

            // No repository found, add path to ignored paths
            var segments = dirName.split('/');
            for (var i:number = segments.length; i > 0; i--) {
                this.ignoredPaths.push(segments.slice(0, i).join('/'));
            }

            return null;
        }


        /**
         * Triggered when the converter has finished resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onEndResolve(context:Context) {
            var project = context.project;
            project.files.forEach((sourceFile) => {
                var repository = this.getRepository(sourceFile.fullFileName);
                if (repository) {
                    sourceFile.url = repository.getGitHubURL(sourceFile.fullFileName);
                }
            });

            for (var key in project.reflections) {
                var reflection = project.reflections[key];
                if (reflection.sources) reflection.sources.forEach((source:models.ISourceReference) => {
                    if (source.file && source.file.url) {
                        source.url = source.file.url + '#L' + source.line;
                    }
                });
            }
        }
    }


    /**
     * Register this handler.
     */
    Converter.registerPlugin('gitHub', GitHubPlugin);
}