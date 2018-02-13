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
var Path = require("path");
var index_1 = require("../../models/reflections/index");
var GroupPlugin_1 = require("../../converter/plugins/GroupPlugin");
var components_1 = require("../components");
var fs_1 = require("../../utils/fs");
var events_1 = require("../events");
var JavascriptIndexPlugin = (function (_super) {
    __extends(JavascriptIndexPlugin, _super);
    function JavascriptIndexPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    JavascriptIndexPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, events_1.RendererEvent.BEGIN, this.onRendererBegin);
    };
    JavascriptIndexPlugin.prototype.onRendererBegin = function (event) {
        var rows = [];
        var kinds = {};
        for (var key in event.project.reflections) {
            var reflection = event.project.reflections[key];
            if (!(reflection instanceof index_1.DeclarationReflection)) {
                continue;
            }
            if (!reflection.url ||
                !reflection.name ||
                reflection.flags.isExternal ||
                reflection.name === '') {
                continue;
            }
            var parent_1 = reflection.parent;
            if (parent_1 instanceof index_1.ProjectReflection) {
                parent_1 = null;
            }
            var row = {
                id: rows.length,
                kind: reflection.kind,
                name: reflection.name,
                url: reflection.url,
                classes: reflection.cssClasses
            };
            if (parent_1) {
                row.parent = parent_1.getFullName();
            }
            if (!kinds[reflection.kind]) {
                kinds[reflection.kind] = GroupPlugin_1.GroupPlugin.getKindSingular(reflection.kind);
            }
            rows.push(row);
        }
        var fileName = Path.join(event.outputDirectory, 'assets', 'js', 'search.js');
        var data = "var typedoc = typedoc || {};\n            typedoc.search = typedoc.search || {};\n            typedoc.search.data = " + JSON.stringify({ kinds: kinds, rows: rows }) + ";";
        fs_1.writeFile(fileName, data, true);
    };
    JavascriptIndexPlugin = __decorate([
        components_1.Component({ name: 'javascript-index' })
    ], JavascriptIndexPlugin);
    return JavascriptIndexPlugin;
}(components_1.RendererComponent));
exports.JavascriptIndexPlugin = JavascriptIndexPlugin;
//# sourceMappingURL=JavascriptIndexPlugin.js.map