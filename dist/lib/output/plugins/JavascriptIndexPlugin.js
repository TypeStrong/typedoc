"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const index_1 = require("../../models/reflections/index");
const GroupPlugin_1 = require("../../converter/plugins/GroupPlugin");
const components_1 = require("../components");
const fs_1 = require("../../utils/fs");
const events_1 = require("../events");
let JavascriptIndexPlugin = class JavascriptIndexPlugin extends components_1.RendererComponent {
    initialize() {
        this.listenTo(this.owner, events_1.RendererEvent.BEGIN, this.onRendererBegin);
    }
    onRendererBegin(event) {
        const rows = [];
        const kinds = {};
        for (let key in event.project.reflections) {
            const reflection = event.project.reflections[key];
            if (!(reflection instanceof index_1.DeclarationReflection)) {
                continue;
            }
            if (!reflection.url ||
                !reflection.name ||
                reflection.flags.isExternal ||
                reflection.name === '') {
                continue;
            }
            let parent = reflection.parent;
            if (parent instanceof index_1.ProjectReflection) {
                parent = undefined;
            }
            const row = {
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
        const fileName = Path.join(event.outputDirectory, 'assets', 'js', 'search.js');
        const data = `var typedoc = typedoc || {};
            typedoc.search = typedoc.search || {};
            typedoc.search.data = ${JSON.stringify({ kinds: kinds, rows: rows })};`;
        fs_1.writeFile(fileName, data, false);
    }
};
JavascriptIndexPlugin = __decorate([
    components_1.Component({ name: 'javascript-index' })
], JavascriptIndexPlugin);
exports.JavascriptIndexPlugin = JavascriptIndexPlugin;
//# sourceMappingURL=JavascriptIndexPlugin.js.map