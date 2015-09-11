var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Path = require("path");
var index_1 = require("../../models/reflections/index");
var GroupPlugin_1 = require("../../converter/plugins/GroupPlugin");
var component_1 = require("../../utils/component");
var fs_1 = require("../../utils/fs");
var Renderer_1 = require("../Renderer");
var JavascriptIndexPlugin = (function (_super) {
    __extends(JavascriptIndexPlugin, _super);
    function JavascriptIndexPlugin() {
        _super.apply(this, arguments);
    }
    JavascriptIndexPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[Renderer_1.Renderer.EVENT_BEGIN] = this.onRendererBegin,
            _a
        ));
        var _a;
    };
    JavascriptIndexPlugin.prototype.onRendererBegin = function (event) {
        var rows = [];
        var kinds = {};
        for (var key in event.project.reflections) {
            var reflection = event.project.reflections[key];
            if (!(reflection instanceof index_1.DeclarationReflection))
                continue;
            if (!reflection.url ||
                !reflection.name ||
                reflection.flags.isExternal ||
                reflection.name == '')
                continue;
            var parent = reflection.parent;
            if (parent instanceof index_1.ProjectReflection) {
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
        fs_1.writeFile(fileName, data, true);
    };
    JavascriptIndexPlugin = __decorate([
        component_1.Component("javascript-index"), 
        __metadata('design:paramtypes', [])
    ], JavascriptIndexPlugin);
    return JavascriptIndexPlugin;
})(component_1.RendererComponent);
exports.JavascriptIndexPlugin = JavascriptIndexPlugin;
