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
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var FS = require("fs");
var theme_1 = require("../theme");
var index_1 = require("../../models/reflections/index");
var UrlMapping_1 = require("../models/UrlMapping");
var NavigationItem_1 = require("../models/NavigationItem");
var events_1 = require("../events");
var DefaultTheme = (function (_super) {
    __extends(DefaultTheme, _super);
    function DefaultTheme(renderer, basePath) {
        var _this = _super.call(this, renderer, basePath) || this;
        _this.listenTo(renderer, events_1.RendererEvent.BEGIN, _this.onRendererBegin, 1024);
        return _this;
    }
    DefaultTheme.prototype.isOutputDirectory = function (path) {
        if (!FS.existsSync(Path.join(path, 'index.html'))) {
            return false;
        }
        if (!FS.existsSync(Path.join(path, 'assets'))) {
            return false;
        }
        if (!FS.existsSync(Path.join(path, 'assets', 'js', 'main.js'))) {
            return false;
        }
        if (!FS.existsSync(Path.join(path, 'assets', 'images', 'icons.png'))) {
            return false;
        }
        return true;
    };
    DefaultTheme.prototype.getUrls = function (project) {
        var urls = [];
        var entryPoint = this.getEntryPoint(project);
        if (this.application.options.getValue('readme') === 'none') {
            entryPoint.url = 'index.html';
            urls.push(new UrlMapping_1.UrlMapping('index.html', entryPoint, 'reflection.hbs'));
        }
        else {
            entryPoint.url = 'globals.html';
            urls.push(new UrlMapping_1.UrlMapping('globals.html', entryPoint, 'reflection.hbs'));
            urls.push(new UrlMapping_1.UrlMapping('index.html', project, 'index.hbs'));
        }
        if (entryPoint.children) {
            entryPoint.children.forEach(function (child) {
                if (child instanceof index_1.DeclarationReflection) {
                    DefaultTheme.buildUrls(child, urls);
                }
            });
        }
        return urls;
    };
    DefaultTheme.prototype.getEntryPoint = function (project) {
        var entryPoint = this.owner.entryPoint;
        if (entryPoint) {
            var reflection = project.getChildByName(entryPoint);
            if (reflection) {
                if (reflection instanceof index_1.ContainerReflection) {
                    return reflection;
                }
                else {
                    this.application.logger.warn('The given entry point `%s` is not a container.', entryPoint);
                }
            }
            else {
                this.application.logger.warn('The entry point `%s` could not be found.', entryPoint);
            }
        }
        return project;
    };
    DefaultTheme.prototype.getNavigation = function (project) {
        function containsExternals(modules) {
            for (var index = 0, length_1 = modules.length; index < length_1; index++) {
                if (modules[index].flags.isExternal) {
                    return true;
                }
            }
            return false;
        }
        function sortReflections(modules) {
            modules.sort(function (a, b) {
                if (a.flags.isExternal && !b.flags.isExternal) {
                    return 1;
                }
                if (!a.flags.isExternal && b.flags.isExternal) {
                    return -1;
                }
                return a.getFullName() < b.getFullName() ? -1 : 1;
            });
        }
        function includeDedicatedUrls(reflection, item) {
            (function walk(reflection) {
                for (var key in reflection.children) {
                    var child = reflection.children[key];
                    if (child.hasOwnDocument && !child.kindOf(index_1.ReflectionKind.SomeModule)) {
                        if (!item.dedicatedUrls) {
                            item.dedicatedUrls = [];
                        }
                        item.dedicatedUrls.push(child.url);
                        walk(child);
                    }
                }
            })(reflection);
        }
        function buildChildren(reflection, parent) {
            var modules = reflection.getChildrenByKind(index_1.ReflectionKind.SomeModule);
            modules.sort(function (a, b) {
                return a.getFullName() < b.getFullName() ? -1 : 1;
            });
            modules.forEach(function (reflection) {
                var item = NavigationItem_1.NavigationItem.create(reflection, parent);
                includeDedicatedUrls(reflection, item);
                buildChildren(reflection, item);
            });
        }
        function buildGroups(reflections, parent, callback) {
            var state = -1;
            var hasExternals = containsExternals(reflections);
            sortReflections(reflections);
            reflections.forEach(function (reflection) {
                if (hasExternals && !reflection.flags.isExternal && state !== 1) {
                    new NavigationItem_1.NavigationItem('Internals', null, parent, 'tsd-is-external');
                    state = 1;
                }
                else if (hasExternals && reflection.flags.isExternal && state !== 2) {
                    new NavigationItem_1.NavigationItem('Externals', null, parent, 'tsd-is-external');
                    state = 2;
                }
                var item = NavigationItem_1.NavigationItem.create(reflection, parent);
                includeDedicatedUrls(reflection, item);
                if (callback) {
                    callback(reflection, item);
                }
            });
        }
        function build(hasSeparateGlobals) {
            var root = new NavigationItem_1.NavigationItem('Index', 'index.html');
            if (entryPoint === project) {
                var globals = new NavigationItem_1.NavigationItem('Globals', hasSeparateGlobals ? 'globals.html' : 'index.html', root);
                globals.isGlobals = true;
            }
            var modules = [];
            project.getReflectionsByKind(index_1.ReflectionKind.SomeModule).forEach(function (someModule) {
                var target = someModule.parent;
                var inScope = (someModule === entryPoint);
                while (target) {
                    if (target.kindOf(index_1.ReflectionKind.ExternalModule)) {
                        return;
                    }
                    if (entryPoint === target) {
                        inScope = true;
                    }
                    target = target.parent;
                }
                if (inScope && someModule instanceof index_1.DeclarationReflection) {
                    modules.push(someModule);
                }
            });
            if (modules.length < 10) {
                buildGroups(modules, root);
            }
            else {
                buildGroups(entryPoint.getChildrenByKind(index_1.ReflectionKind.SomeModule), root, buildChildren);
            }
            return root;
        }
        var entryPoint = this.getEntryPoint(project);
        return build(this.application.options.getValue('readme') !== 'none');
    };
    DefaultTheme.prototype.onRendererBegin = function (event) {
        if (event.project.groups) {
            event.project.groups.forEach(DefaultTheme.applyGroupClasses);
        }
        for (var id in event.project.reflections) {
            var reflection = event.project.reflections[id];
            if (reflection instanceof index_1.DeclarationReflection) {
                DefaultTheme.applyReflectionClasses(reflection);
            }
            if (reflection instanceof index_1.ContainerReflection && reflection['groups']) {
                reflection['groups'].forEach(DefaultTheme.applyGroupClasses);
            }
        }
    };
    DefaultTheme.getUrl = function (reflection, relative, separator) {
        if (separator === void 0) { separator = '.'; }
        var url = reflection.getAlias();
        if (reflection.parent && reflection.parent !== relative &&
            !(reflection.parent instanceof index_1.ProjectReflection)) {
            url = DefaultTheme.getUrl(reflection.parent, relative, separator) + separator + url;
        }
        return url;
    };
    DefaultTheme.getMapping = function (reflection) {
        for (var i = 0, c = DefaultTheme.MAPPINGS.length; i < c; i++) {
            var mapping = DefaultTheme.MAPPINGS[i];
            if (reflection.kindOf(mapping.kind)) {
                return mapping;
            }
        }
        return null;
    };
    DefaultTheme.buildUrls = function (reflection, urls) {
        var mapping = DefaultTheme.getMapping(reflection);
        if (mapping) {
            if (!reflection.url || !DefaultTheme.URL_PREFIX.test(reflection.url)) {
                var url = [mapping.directory, DefaultTheme.getUrl(reflection) + '.html'].join('/');
                urls.push(new UrlMapping_1.UrlMapping(url, reflection, mapping.template));
                reflection.url = url;
                reflection.hasOwnDocument = true;
            }
            for (var key in reflection.children) {
                var child = reflection.children[key];
                if (mapping.isLeaf) {
                    DefaultTheme.applyAnchorUrl(child, reflection);
                }
                else {
                    DefaultTheme.buildUrls(child, urls);
                }
            }
        }
        else {
            DefaultTheme.applyAnchorUrl(reflection, reflection.parent);
        }
        return urls;
    };
    DefaultTheme.applyAnchorUrl = function (reflection, container) {
        if (!reflection.url || !DefaultTheme.URL_PREFIX.test(reflection.url)) {
            var anchor = DefaultTheme.getUrl(reflection, container, '.');
            if (reflection['isStatic']) {
                anchor = 'static-' + anchor;
            }
            reflection.url = container.url + '#' + anchor;
            reflection.anchor = anchor;
            reflection.hasOwnDocument = false;
        }
        reflection.traverse(function (child) {
            if (child instanceof index_1.DeclarationReflection) {
                DefaultTheme.applyAnchorUrl(child, container);
            }
        });
    };
    DefaultTheme.applyReflectionClasses = function (reflection) {
        var classes = [];
        var kind;
        if (reflection.kind === index_1.ReflectionKind.Accessor) {
            if (!reflection.getSignature) {
                classes.push('tsd-kind-set-signature');
            }
            else if (!reflection.setSignature) {
                classes.push('tsd-kind-get-signature');
            }
            else {
                classes.push('tsd-kind-accessor');
            }
        }
        else {
            kind = index_1.ReflectionKind[reflection.kind];
            classes.push(DefaultTheme.toStyleClass('tsd-kind-' + kind));
        }
        if (reflection.parent && reflection.parent instanceof index_1.DeclarationReflection) {
            kind = index_1.ReflectionKind[reflection.parent.kind];
            classes.push(DefaultTheme.toStyleClass("tsd-parent-kind-" + kind));
        }
        var hasTypeParameters = !!reflection.typeParameters;
        reflection.getAllSignatures().forEach(function (signature) {
            hasTypeParameters = hasTypeParameters || !!signature.typeParameters;
        });
        if (hasTypeParameters) {
            classes.push('tsd-has-type-parameter');
        }
        if (reflection.overwrites) {
            classes.push('tsd-is-overwrite');
        }
        if (reflection.inheritedFrom) {
            classes.push('tsd-is-inherited');
        }
        if (reflection.flags.isPrivate) {
            classes.push('tsd-is-private');
        }
        if (reflection.flags.isProtected) {
            classes.push('tsd-is-protected');
        }
        if (reflection.flags.isStatic) {
            classes.push('tsd-is-static');
        }
        if (reflection.flags.isExternal) {
            classes.push('tsd-is-external');
        }
        if (!reflection.flags.isExported) {
            classes.push('tsd-is-not-exported');
        }
        reflection.cssClasses = classes.join(' ');
    };
    DefaultTheme.applyGroupClasses = function (group) {
        var classes = [];
        if (group.allChildrenAreInherited) {
            classes.push('tsd-is-inherited');
        }
        if (group.allChildrenArePrivate) {
            classes.push('tsd-is-private');
        }
        if (group.allChildrenAreProtectedOrPrivate) {
            classes.push('tsd-is-private-protected');
        }
        if (group.allChildrenAreExternal) {
            classes.push('tsd-is-external');
        }
        if (!group.someChildrenAreExported) {
            classes.push('tsd-is-not-exported');
        }
        group.cssClasses = classes.join(' ');
    };
    DefaultTheme.toStyleClass = function (str) {
        return str.replace(/(\w)([A-Z])/g, function (m, m1, m2) { return m1 + '-' + m2; }).toLowerCase();
    };
    DefaultTheme.MAPPINGS = [{
            kind: [index_1.ReflectionKind.Class],
            isLeaf: false,
            directory: 'classes',
            template: 'reflection.hbs'
        }, {
            kind: [index_1.ReflectionKind.Interface],
            isLeaf: false,
            directory: 'interfaces',
            template: 'reflection.hbs'
        }, {
            kind: [index_1.ReflectionKind.Enum],
            isLeaf: false,
            directory: 'enums',
            template: 'reflection.hbs'
        }, {
            kind: [index_1.ReflectionKind.Module, index_1.ReflectionKind.ExternalModule],
            isLeaf: false,
            directory: 'modules',
            template: 'reflection.hbs'
        }];
    DefaultTheme.URL_PREFIX = /^(http|ftp)s?:\/\//;
    return DefaultTheme;
}(theme_1.Theme));
exports.DefaultTheme = DefaultTheme;
//# sourceMappingURL=DefaultTheme.js.map