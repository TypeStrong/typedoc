"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ShellJS = require("shelljs");
var Path = require("path");
var components_1 = require("../components");
var base_path_1 = require("../utils/base-path");
var converter_1 = require("../converter");
var component_1 = require("../../utils/component");
var declaration_1 = require("../../utils/options/declaration");
var Repository = (function () {
    function Repository(path, gitRevision) {
        var _this = this;
        this.files = [];
        this.path = path;
        this.branch = gitRevision || 'master';
        ShellJS.pushd(path);
        var out = ShellJS.exec('git ls-remote --get-url', { silent: true });
        if (out.code === 0) {
            var url = void 0;
            var remotes = out.stdout.split('\n');
            for (var i = 0, c = remotes.length; i < c; i++) {
                url = /github\.com[:\/]([^\/]+)\/(.*)/.exec(remotes[i]);
                if (url) {
                    this.gitHubUser = url[1];
                    this.gitHubProject = url[2];
                    if (this.gitHubProject.substr(-4) === '.git') {
                        this.gitHubProject = this.gitHubProject.substr(0, this.gitHubProject.length - 4);
                    }
                    break;
                }
            }
        }
        out = ShellJS.exec('git ls-files', { silent: true });
        if (out.code === 0) {
            out.stdout.split('\n').forEach(function (file) {
                if (file !== '') {
                    _this.files.push(base_path_1.BasePath.normalize(path + '/' + file));
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
    Repository.prototype.contains = function (fileName) {
        return this.files.indexOf(fileName) !== -1;
    };
    Repository.prototype.getGitHubURL = function (fileName) {
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
    };
    Repository.tryCreateRepository = function (path, gitRevision) {
        ShellJS.pushd(path);
        var out = ShellJS.exec('git rev-parse --show-toplevel', { silent: true });
        ShellJS.popd();
        if (!out || out.code !== 0) {
            return null;
        }
        return new Repository(base_path_1.BasePath.normalize(out.stdout.replace('\n', '')), gitRevision);
    };
    return Repository;
}());
var GitHubPlugin = (function (_super) {
    __extends(GitHubPlugin, _super);
    function GitHubPlugin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.repositories = {};
        _this.ignoredPaths = [];
        return _this;
    }
    GitHubPlugin.prototype.initialize = function () {
        ShellJS.config.silent = true;
        if (ShellJS.which('git')) {
            this.listenTo(this.owner, converter_1.Converter.EVENT_RESOLVE_END, this.onEndResolve);
        }
    };
    GitHubPlugin.prototype.getRepository = function (fileName) {
        var dirName = Path.dirname(fileName);
        for (var i = 0, c = this.ignoredPaths.length; i < c; i++) {
            if (this.ignoredPaths[i] === dirName) {
                return null;
            }
        }
        for (var path in this.repositories) {
            if (!this.repositories.hasOwnProperty(path)) {
                continue;
            }
            if (fileName.substr(0, path.length) === path) {
                return this.repositories[path];
            }
        }
        var repository = Repository.tryCreateRepository(dirName, this.gitRevision);
        if (repository) {
            this.repositories[repository.path] = repository;
            return repository;
        }
        var segments = dirName.split('/');
        for (var i = segments.length; i > 0; i--) {
            this.ignoredPaths.push(segments.slice(0, i).join('/'));
        }
        return null;
    };
    GitHubPlugin.prototype.onEndResolve = function (context) {
        var _this = this;
        var project = context.project;
        project.files.forEach(function (sourceFile) {
            var repository = _this.getRepository(sourceFile.fullFileName);
            if (repository) {
                sourceFile.url = repository.getGitHubURL(sourceFile.fullFileName);
            }
        });
        for (var key in project.reflections) {
            var reflection = project.reflections[key];
            if (reflection.sources) {
                reflection.sources.forEach(function (source) {
                    if (source.file && source.file.url) {
                        source.url = source.file.url + '#L' + source.line;
                    }
                });
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
    return GitHubPlugin;
}(components_1.ConverterComponent));
exports.GitHubPlugin = GitHubPlugin;
//# sourceMappingURL=GitHubPlugin.js.map