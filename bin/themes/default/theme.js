var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var Theme = (function (_super) {
    __extends(Theme, _super);
    function Theme() {
        _super.apply(this, arguments);
    }
    Theme.prototype.isOutputDirectory = function (dirname) {
        if (!FS.existsSync(Path.join(dirname, 'assets')))
            return false;

        return true;
    };

    Theme.prototype.getMapping = function (reflection) {
        for (var i = 0, c = Theme.MAPPINGS.length; i < c; i++) {
            var mapping = Theme.MAPPINGS[i];
            if (reflection.kindOf(mapping.kind)) {
                return mapping;
            }
        }

        return null;
    };

    Theme.prototype.getUrls = function () {
        var _this = this;
        var urls = [];

        var createUrl = function (reflection, to, separator) {
            if (typeof separator === "undefined") { separator = '.'; }
            var url = reflection.getAlias();
            if (reflection.parent && reflection.parent != to && !(reflection.parent instanceof TypeDoc.Models.ProjectReflection)) {
                url = createUrl(reflection.parent, to, separator) + separator + url;
            }
            return url;
        };

        var walkLeaf = function (reflection, container) {
            reflection.children.forEach(function (child) {
                if (child.kindOf(TypeDoc.Models.Kind.Parameter)) {
                    return;
                }

                child.url = container.url + '#' + createUrl(child, container, '.');
                walkLeaf(child, container);
            });
        };

        var walkReflection = function (reflection, container) {
            reflection.children.forEach(function (child) {
                var mapping = _this.getMapping(child);
                if (mapping) {
                    child.url = Path.join(mapping.prefix, createUrl(child) + '.html');
                    child.hasOwnDocument = true;
                    urls.push(new TypeDoc.Models.UrlMapping(child.url, child, mapping.template));

                    if (mapping.isLeaf) {
                        walkLeaf(child, child);
                    } else {
                        walkReflection(child, child);
                    }
                } else {
                    child.url = container.url + '#' + createUrl(child, container, '.');
                    walkLeaf(child, container);
                }
            });
        };

        this.project.url = 'modules/_globals.html';
        urls.push(new TypeDoc.Models.UrlMapping('modules/_globals.html', this.project, 'reflection.hbs'));

        walkReflection(this.project, this.project);

        return urls;
    };

    Theme.prototype.getNavigation = function () {
        function walkReflection(reflection, parent) {
            var name = parent == root ? reflection.getFullName() : reflection.name;
            var item = new TypeDoc.Models.NavigationItem(name, reflection.url, parent);
            item.isPrimary = (parent == root);
            item.cssClasses = reflection.getCssClasses();

            reflection.children.forEach(function (child) {
                if (child.kindOf(TypeDoc.Models.Kind.SomeContainer))
                    return;
                walkReflection(child, item);
            });
        }

        var root = new TypeDoc.Models.NavigationItem('Index', 'index.html');
        new TypeDoc.Models.NavigationItem('Globals', 'globals.html', root);

        var modules = this.project.getReflectionsByKind(TypeDoc.Models.Kind.SomeContainer);
        modules.forEach(function (container) {
            return walkReflection(container, root);
        });

        return root;
    };
    Theme.MAPPINGS = [
        {
            kind: TypeDoc.Models.Kind.Class,
            isLeaf: true,
            prefix: 'classes',
            template: 'reflection.hbs'
        }, {
            kind: TypeDoc.Models.Kind.Interface,
            isLeaf: true,
            prefix: 'interfaces',
            template: 'reflection.hbs'
        }, {
            kind: TypeDoc.Models.Kind.Enum,
            isLeaf: true,
            prefix: 'enums',
            template: 'reflection.hbs'
        }, {
            kind: [TypeDoc.Models.Kind.Container, TypeDoc.Models.Kind.DynamicModule],
            isLeaf: false,
            prefix: 'modules',
            template: 'reflection.hbs'
        }];
    return Theme;
})(TypeDoc.Renderer.BaseTheme);
exports.Theme = Theme;
