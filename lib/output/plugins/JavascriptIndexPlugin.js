var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var Renderer_1 = require("../Renderer");
var RendererPlugin_1 = require("../RendererPlugin");
var DeclarationReflection_1 = require("../../models/reflections/DeclarationReflection");
var ProjectReflection_1 = require("../../models/reflections/ProjectReflection");
var GroupPlugin_1 = require("../../converter/plugins/GroupPlugin");
var Utils_1 = require("../../Utils");
var JavascriptIndexPlugin = (function (_super) {
    __extends(JavascriptIndexPlugin, _super);
    function JavascriptIndexPlugin(renderer) {
        _super.call(this, renderer);
        renderer.on(Renderer_1.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
    }
    JavascriptIndexPlugin.prototype.onRendererBegin = function (event) {
        var rows = [];
        var kinds = {};
        for (var key in event.project.reflections) {
            var reflection = event.project.reflections[key];
            if (!(reflection instanceof DeclarationReflection_1.DeclarationReflection))
                continue;
            if (!reflection.url ||
                !reflection.name ||
                reflection.flags.isExternal ||
                reflection.name == '')
                continue;
            var parent = reflection.parent;
            if (parent instanceof ProjectReflection_1.ProjectReflection) {
                parent = null;
            }
            var row = {
                id: rows.length,
                kind: reflection.kind,
                name: reflection.name,
                url: reflection.url,
                classes: reflection.cssClasses
            };
            if (parent) {
                row.parent = parent.getFullName();
            }
            if (!kinds[reflection.kind]) {
                kinds[reflection.kind] = GroupPlugin_1.GroupPlugin.getKindSingular(reflection.kind);
            }
            rows.push(row);
        }
        var fileName = Path.join(event.outputDirectory, 'assets', 'js', 'search.js');
        var data = 'var typedoc = typedoc || {};' +
            'typedoc.search = typedoc.search || {};' +
            'typedoc.search.data = ' + JSON.stringify({ kinds: kinds, rows: rows }) + ';';
        Utils_1.writeFile(fileName, data, true);
    };
    return JavascriptIndexPlugin;
})(RendererPlugin_1.RendererPlugin);
exports.JavascriptIndexPlugin = JavascriptIndexPlugin;
Renderer_1.Renderer.registerPlugin('javascriptIndex', JavascriptIndexPlugin);
