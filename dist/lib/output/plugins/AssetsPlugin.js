"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const FS = require("fs-extra");
const components_1 = require("../components");
const events_1 = require("../events");
const renderer_1 = require("../renderer");
let AssetsPlugin = class AssetsPlugin extends components_1.RendererComponent {
    constructor() {
        super(...arguments);
        this.copyDefaultAssets = true;
    }
    initialize() {
        this.listenTo(this.owner, {
            [events_1.RendererEvent.BEGIN]: this.onRendererBegin
        });
    }
    onRendererBegin(event) {
        let fromDefault = Path.join(renderer_1.Renderer.getDefaultTheme(), 'assets');
        const to = Path.join(event.outputDirectory, 'assets');
        if (this.copyDefaultAssets) {
            FS.copySync(fromDefault, to);
        }
        else {
            fromDefault = undefined;
        }
        const from = Path.join(this.owner.theme.basePath, 'assets');
        if (from !== fromDefault && FS.existsSync(from)) {
            FS.copySync(from, to);
        }
    }
};
AssetsPlugin = __decorate([
    components_1.Component({ name: 'assets' })
], AssetsPlugin);
exports.AssetsPlugin = AssetsPlugin;
//# sourceMappingURL=AssetsPlugin.js.map