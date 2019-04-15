"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ShellJS = require("shelljs");
const Path = require("path");
const components_1 = require("../components");
const base_path_1 = require("../utils/base-path");
const converter_1 = require("../converter");
const component_1 = require("../../utils/component");
const declaration_1 = require("../../utils/options/declaration");
class Repository {
    constructor(path, gitRevision, repoLinks) {
        this.files = [];
        this.gitHubHostname = 'github.com';
        this.path = path;
        this.branch = gitRevision || 'master';
        ShellJS.pushd(path);
        let url;
        for (let i = 0, c = repoLinks.length; i < c; i++) {
            url = /(github(?:\.[a-z]+)*\.com)[:\/]([^\/]+)\/(.*)/.exec(repoLinks[i]);
            if (url) {
                this.gitHubHostname = url[1];
                this.gitHubUser = url[2];
                this.gitHubProject = url[3];
                if (this.gitHubProject.substr(-4) === '.git') {
                    this.gitHubProject = this.gitHubProject.substr(0, this.gitHubProject.length - 4);
                }
                break;
            }
        }
        let out = ShellJS.exec('git ls-files', { silent: true });
        if (out.code === 0) {
            out.stdout.split('\n').forEach((file) => {
                if (file !== '') {
                    this.files.push(base_path_1.BasePath.normalize(path + '/' + file));
                }
            });
        }
        if (!gitRevision) {
            out = ShellJS.exec('git rev-parse --short HEAD', { silent: true });
            if (out.code === 0) {
                this.branch = out.stdout.replace('\n', '');
            }
        }
        ShellJS.popd();
    }
    contains(fileName) {
        return this.files.includes(fileName);
    }
    getGitHubURL(fileName) {
        if (!this.gitHubUser || !this.gitHubProject || !this.contains(fileName)) {
            return;
        }
        return [
            `https://${this.gitHubHostname}`,
            this.gitHubUser,
            this.gitHubProject,
            'blob',
            this.branch,
            fileName.substr(this.path.length + 1)
        ].join('/');
    }
    static tryCreateRepository(path, gitRevision) {
        ShellJS.pushd(path);
        const out = ShellJS.exec('git rev-parse --show-toplevel', { silent: true });
        ShellJS.popd();
        if (!out || out.code !== 0) {
            return;
        }
        let remotesOutput = ShellJS.exec('git ls-remote --get-url', { silent: true });
        let remotes = (remotesOutput.code === 0) ? remotesOutput.stdout.split('\n') : [];
        return new Repository(base_path_1.BasePath.normalize(out.stdout.replace('\n', '')), gitRevision, remotes);
    }
}
exports.Repository = Repository;
let GitHubPlugin = class GitHubPlugin extends components_1.ConverterComponent {
    constructor() {
        super(...arguments);
        this.repositories = {};
        this.ignoredPaths = [];
    }
    initialize() {
        ShellJS.config.silent = true;
        if (ShellJS.which('git')) {
            this.listenTo(this.owner, converter_1.Converter.EVENT_RESOLVE_END, this.onEndResolve);
        }
    }
    getRepository(fileName) {
        const dirName = Path.dirname(fileName);
        for (let i = 0, c = this.ignoredPaths.length; i < c; i++) {
            if (this.ignoredPaths[i] === dirName) {
                return;
            }
        }
        for (let path in this.repositories) {
            if (!this.repositories.hasOwnProperty(path)) {
                continue;
            }
            if (fileName.substr(0, path.length).toLowerCase() === path) {
                return this.repositories[path];
            }
        }
        const repository = Repository.tryCreateRepository(dirName, this.gitRevision);
        if (repository) {
            this.repositories[repository.path.toLowerCase()] = repository;
            return repository;
        }
        const segments = dirName.split('/');
        for (let i = segments.length; i > 0; i--) {
            this.ignoredPaths.push(segments.slice(0, i).join('/'));
        }
    }
    onEndResolve(context) {
        const project = context.project;
        project.files.forEach((sourceFile) => {
            const repository = this.getRepository(sourceFile.fullFileName);
            if (repository) {
                sourceFile.url = repository.getGitHubURL(sourceFile.fullFileName);
            }
        });
        for (let key in project.reflections) {
            const reflection = project.reflections[key];
            if (reflection.sources) {
                reflection.sources.forEach((source) => {
                    if (source.file && source.file.url) {
                        source.url = source.file.url + '#L' + source.line;
                    }
                });
            }
        }
    }
};
__decorate([
    component_1.Option({
        name: 'gitRevision',
        help: 'Use specified revision instead of the last revision for linking to GitHub source files.',
        type: declaration_1.ParameterType.String
    })
], GitHubPlugin.prototype, "gitRevision", void 0);
GitHubPlugin = __decorate([
    components_1.Component({ name: 'git-hub' })
], GitHubPlugin);
exports.GitHubPlugin = GitHubPlugin;
//# sourceMappingURL=GitHubPlugin.js.map