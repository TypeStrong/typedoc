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
var FS = require("fs");
var components_1 = require("../components");
var converter_1 = require("../converter");
var component_1 = require("../../utils/component");
var PackagePlugin = (function (_super) {
    __extends(PackagePlugin, _super);
    function PackagePlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PackagePlugin.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[converter_1.Converter.EVENT_BEGIN] = this.onBegin,
            _a[converter_1.Converter.EVENT_FILE_BEGIN] = this.onBeginDocument,
            _a[converter_1.Converter.EVENT_RESOLVE_BEGIN] = this.onBeginResolve,
            _a));
        var _a;
    };
    PackagePlugin.prototype.onBegin = function (context) {
        this.readmeFile = null;
        this.packageFile = null;
        this.visited = [];
        var readme = this.readme;
        this.noReadmeFile = (readme === 'none');
        if (!this.noReadmeFile && readme) {
            readme = Path.resolve(readme);
            if (FS.existsSync(readme)) {
                this.readmeFile = readme;
            }
        }
    };
    PackagePlugin.prototype.onBeginDocument = function (context, reflection, node) {
        var _this = this;
        if (!node) {
            return;
        }
        if (this.readmeFile && this.packageFile) {
            return;
        }
        var fileName = node.fileName;
        var dirName, parentDir = Path.resolve(Path.dirname(fileName));
        do {
            dirName = parentDir;
            if (this.visited.indexOf(dirName) !== -1) {
                break;
            }
            FS.readdirSync(dirName).forEach(function (file) {
                var lfile = file.toLowerCase();
                if (!_this.noReadmeFile && !_this.readmeFile && lfile === 'readme.md') {
                    _this.readmeFile = Path.join(dirName, file);
                }
                if (!_this.packageFile && lfile === 'package.json') {
                    _this.packageFile = Path.join(dirName, file);
                }
            });
            this.visited.push(dirName);
            parentDir = Path.resolve(Path.join(dirName, '..'));
        } while (dirName !== parentDir);
    };
    PackagePlugin.prototype.onBeginResolve = function (context) {
        var project = context.project;
        if (this.readmeFile) {
            project.readme = FS.readFileSync(this.readmeFile, 'utf-8');
        }
        if (this.packageFile) {
            project.packageInfo = JSON.parse(FS.readFileSync(this.packageFile, 'utf-8'));
            if (!project.name) {
                project.name = project.packageInfo.name;
            }
        }
    };
    __decorate([
        component_1.Option({
            name: 'readme',
            help: 'Path to the readme file that should be displayed on the index page. Pass `none` to disable the index page and start the documentation on the globals page.'
        })
    ], PackagePlugin.prototype, "readme", void 0);
    PackagePlugin = __decorate([
        components_1.Component({ name: 'package' })
    ], PackagePlugin);
    return PackagePlugin;
}(components_1.ConverterComponent));
exports.PackagePlugin = PackagePlugin;
//# sourceMappingURL=PackagePlugin.js.map