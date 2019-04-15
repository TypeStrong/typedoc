"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const FS = require("fs");
const components_1 = require("../components");
const converter_1 = require("../converter");
const component_1 = require("../../utils/component");
let PackagePlugin = class PackagePlugin extends components_1.ConverterComponent {
    initialize() {
        this.listenTo(this.owner, {
            [converter_1.Converter.EVENT_BEGIN]: this.onBegin,
            [converter_1.Converter.EVENT_FILE_BEGIN]: this.onBeginDocument,
            [converter_1.Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve
        });
    }
    onBegin(context) {
        this.readmeFile = undefined;
        this.packageFile = undefined;
        this.visited = [];
        let readme = this.readme;
        this.noReadmeFile = (readme === 'none');
        if (!this.noReadmeFile && readme) {
            readme = Path.resolve(readme);
            if (FS.existsSync(readme)) {
                this.readmeFile = readme;
            }
        }
    }
    onBeginDocument(context, reflection, node) {
        if (!node) {
            return;
        }
        if (this.readmeFile && this.packageFile) {
            return;
        }
        const fileName = node.fileName;
        let dirName, parentDir = Path.resolve(Path.dirname(fileName));
        do {
            dirName = parentDir;
            if (this.visited.includes(dirName)) {
                break;
            }
            FS.readdirSync(dirName).forEach((file) => {
                const lfile = file.toLowerCase();
                if (!this.noReadmeFile && !this.readmeFile && lfile === 'readme.md') {
                    this.readmeFile = Path.join(dirName, file);
                }
                if (!this.packageFile && lfile === 'package.json') {
                    this.packageFile = Path.join(dirName, file);
                }
            });
            this.visited.push(dirName);
            parentDir = Path.resolve(Path.join(dirName, '..'));
        } while (dirName !== parentDir);
    }
    onBeginResolve(context) {
        const project = context.project;
        if (this.readmeFile) {
            project.readme = FS.readFileSync(this.readmeFile, 'utf-8');
        }
        if (this.packageFile) {
            project.packageInfo = JSON.parse(FS.readFileSync(this.packageFile, 'utf-8'));
            if (!project.name) {
                project.name = project.packageInfo.name;
            }
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
exports.PackagePlugin = PackagePlugin;
//# sourceMappingURL=PackagePlugin.js.map