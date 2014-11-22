var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Theme = (function (_super) {
    __extends(Theme, _super);
    function Theme(renderer, basePath) {
        _super.call(this, renderer, basePath);

        renderer.removePlugin(td.AssetsPlugin);
        renderer.removePlugin(td.JavascriptIndexPlugin);
        renderer.removePlugin(td.NavigationPlugin);
        renderer.removePlugin(td.TocPlugin);

        renderer.on(td.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
    }
    Theme.prototype.isOutputDirectory = function (path) {
        if (!td.FS.existsSync(td.Path.join(path, 'index.html')))
            return false;
        return true;
    };

    Theme.prototype.getUrls = function (project) {
        var urls = [];
        urls.push(new td.UrlMapping('index.html', project, 'index.hbs'));

        project.location = {
            url: 'index.html',
            anchor: null,
            hasOwnDocument: true
        };

        project.children.forEach(function (child) {
            td.DefaultTheme.applyAnchorUrl(child, project);
        });

        return urls;
    };

    Theme.prototype.onRendererBeginPage = function (page) {
        var model = page.model;
        if (!(model instanceof td.Reflection)) {
            return;
        }

        page.toc = new td.NavigationItem();
        Theme.buildToc(page.model, page.toc);
    };

    Theme.buildToc = function (model, parent) {
        model.children.forEach(function (child) {
            var item = td.NavigationItem.create(child, parent, true);
            Theme.buildToc(child, item);
        });
    };
    return Theme;
})(td.DefaultTheme);
exports.Theme = Theme;
