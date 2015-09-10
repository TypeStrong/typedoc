var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var FS = require("fs");
var converter_1 = require("../converter");
var plugin_1 = require("../plugin");
var PackagePlugin = (function (_super) {
    __extends(PackagePlugin, _super);
    function PackagePlugin(converter) {
        _super.call(this, converter);
        converter.on(converter_1.Converter.EVENT_BEGIN, this.onBegin, this);
        converter.on(converter_1.Converter.EVENT_FILE_BEGIN, this.onBeginDocument, this);
        converter.on(converter_1.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
    }
    PackagePlugin.prototype.getParameters = function () {
        return [{
                name: 'readme',
                help: 'Path to the readme file that should be displayed on the index page. Pass `none` to disable the index page and start the documentation on the globals page.'
            }];
    };
    PackagePlugin.prototype.onBegin = function (context) {
        this.readmeFile = null;
        this.packageFile = null;
        this.visited = [];
        var readme = context.getOptions().readme;
        this.noReadmeFile = (readme == 'none');
        if (!this.noReadmeFile && readme) {
            readme = Path.resolve(readme);
            if (FS.existsSync(readme)) {
                this.readmeFile = readme;
            }
        }
    };
    PackagePlugin.prototype.onBeginDocument = function (context, reflection, node) {
        var _this = this;
        if (!node)
            return;
        if (this.readmeFile && this.packageFile) {
            return;
        }
        var fileName = node.fileName;
        var dirName, parentDir = Path.resolve(Path.dirname(fileName));
        do {
            dirName = parentDir;
            if (this.visited.indexOf(dirName) != -1) {
                break;
            }
            FS.readdirSync(dirName).forEach(function (file) {
                var lfile = file.toLowerCase();
                if (!_this.noReadmeFile && !_this.readmeFile && lfile == 'readme.md') {
                    _this.readmeFile = Path.join(dirName, file);
                }
                if (!_this.packageFile && lfile == 'package.json') {
                    _this.packageFile = Path.join(dirName, file);
                }
            });
            this.visited.push(dirName);
            parentDir = Path.resolve(Path.join(dirName, '..'));
        } while (dirName != parentDir);
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
    return PackagePlugin;
})(plugin_1.ConverterPlugin);
exports.PackagePlugin = PackagePlugin;
converter_1.Converter.registerPlugin('package', PackagePlugin);
