"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const abstract_1 = require("../../models/reflections/abstract");
const components_1 = require("../components");
const base_path_1 = require("../utils/base-path");
const converter_1 = require("../converter");
let DynamicModulePlugin = class DynamicModulePlugin extends components_1.ConverterComponent {
    constructor() {
        super(...arguments);
        this.basePath = new base_path_1.BasePath();
    }
    initialize() {
        this.listenTo(this.owner, {
            [converter_1.Converter.EVENT_BEGIN]: this.onBegin,
            [converter_1.Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
            [converter_1.Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve
        });
    }
    onBegin(context) {
        this.basePath.reset();
        this.reflections = [];
    }
    onDeclaration(context, reflection, node) {
        if (reflection.kindOf(abstract_1.ReflectionKind.ExternalModule)) {
            let name = reflection.name;
            if (!name.includes('/')) {
                return;
            }
            name = name.replace(/"/g, '');
            this.reflections.push(reflection);
            this.basePath.add(name);
        }
    }
    onBeginResolve(context) {
        this.reflections.forEach((reflection) => {
            let name = reflection.name.replace(/"/g, '');
            name = name.substr(0, name.length - Path.extname(name).length);
            reflection.name = '"' + this.basePath.trim(name) + '"';
        });
    }
};
DynamicModulePlugin = __decorate([
    components_1.Component({ name: 'dynamic-module' })
], DynamicModulePlugin);
exports.DynamicModulePlugin = DynamicModulePlugin;
//# sourceMappingURL=DynamicModulePlugin.js.map