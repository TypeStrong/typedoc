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

        renderer.removePlugin(TypeDoc.Output.AssetsPlugin);
        renderer.removePlugin(TypeDoc.Output.JavascriptIndexPlugin);
        renderer.removePlugin(TypeDoc.Output.NavigationPlugin);
        renderer.removePlugin(TypeDoc.Output.TocPlugin);

        renderer.on(TypeDoc.Output.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
    }
    Theme.prototype.isOutputDirectory = function (path) {
        if (!FS.existsSync(Path.join(path, 'index.html')))
            return false;
        return true;
    };

    Theme.prototype.getUrls = function (project) {
        var urls = [];
        urls.push(new TypeDoc.Models.UrlMapping('index.html', project, 'index.hbs'));

        project.url = 'index.html';
        project.anchor = null;
        project.hasOwnDocument = true;

        project.children.forEach(function (child) {
            TypeDoc.Output.DefaultTheme.applyAnchorUrl(child, project);
        });

        return urls;
    };

    Theme.prototype.onRendererBeginPage = function (page) {
        var model = page.model;
        if (!(model instanceof TypeDoc.Models.BaseReflection)) {
            return;
        }

        page.toc = new TypeDoc.Models.NavigationItem();
        Theme.buildToc(page.model, page.toc);
    };

    Theme.buildToc = function (model, parent) {
        model.children.forEach(function (child) {
            var item = TypeDoc.Models.NavigationItem.create(child, parent, true);
            Theme.buildToc(child, item);
        });
    };
    return Theme;
})(TypeDoc.Output.DefaultTheme);
exports.Theme = Theme;
