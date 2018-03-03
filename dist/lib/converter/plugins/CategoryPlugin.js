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
var index_1 = require("../../models/reflections/index");
var ReflectionCategory_1 = require("../../models/ReflectionCategory");
var components_1 = require("../components");
var converter_1 = require("../converter");
var GroupPlugin_1 = require("./GroupPlugin");
var CategoryPlugin = (function (_super) {
    __extends(CategoryPlugin, _super);
    function CategoryPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CategoryPlugin_1 = CategoryPlugin;
    CategoryPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[converter_1.Converter.EVENT_RESOLVE] = this.onResolve,
            _a[converter_1.Converter.EVENT_RESOLVE_END] = this.onEndResolve,
            _a));
        var _a;
    };
    CategoryPlugin.prototype.onResolve = function (context, reflection) {
        if (reflection instanceof index_1.ContainerReflection) {
            var container = reflection;
            if (container.children && container.children.length > 0) {
                container.children.sort(GroupPlugin_1.GroupPlugin.sortCallback);
                container.categories = CategoryPlugin_1.getReflectionCategories(container.children);
            }
            if (container.categories && container.categories.length > 1) {
                container.categories.sort(CategoryPlugin_1.sortCatCallback);
            }
        }
    };
    CategoryPlugin.prototype.onEndResolve = function (context) {
        function walkDirectory(directory) {
            directory.categories = CategoryPlugin_1.getReflectionCategories(directory.getAllReflections());
            for (var key in directory.directories) {
                if (!directory.directories.hasOwnProperty(key)) {
                    continue;
                }
                walkDirectory(directory.directories[key]);
            }
        }
        var project = context.project;
        if (project.children && project.children.length > 0) {
            project.children.sort(GroupPlugin_1.GroupPlugin.sortCallback);
            project.categories = CategoryPlugin_1.getReflectionCategories(project.children);
        }
        if (project.categories && project.categories.length > 1) {
            project.categories.sort(CategoryPlugin_1.sortCatCallback);
        }
        walkDirectory(project.directory);
        project.files.forEach(function (file) {
            file.categories = CategoryPlugin_1.getReflectionCategories(file.reflections);
        });
    };
    CategoryPlugin.getReflectionCategories = function (reflections) {
        var categories = [];
        reflections.forEach(function (child) {
            var childCat = CategoryPlugin_1.getCategory(child);
            if (childCat === '') {
                return;
            }
            for (var i = 0; i < categories.length; i++) {
                var category_1 = categories[i];
                if (category_1.title !== childCat) {
                    continue;
                }
                category_1.children.push(child);
                return;
            }
            var category = new ReflectionCategory_1.ReflectionCategory(childCat);
            category.children.push(child);
            categories.push(category);
        });
        return categories;
    };
    CategoryPlugin.getCategory = function (reflection) {
        if (reflection.comment) {
            var tags = reflection.comment.tags;
            if (tags) {
                for (var i = 0; i < tags.length; i++) {
                    if (tags[i].tagName === 'category') {
                        var tag = tags[i].text;
                        return (tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()).trim();
                    }
                }
            }
        }
        return '';
    };
    CategoryPlugin.sortCallback = function (a, b) {
        return a.name > b.name ? 1 : -1;
    };
    CategoryPlugin.sortCatCallback = function (a, b) {
        var aWeight = CategoryPlugin_1.WEIGHTS.indexOf(a.title);
        var bWeight = CategoryPlugin_1.WEIGHTS.indexOf(b.title);
        if (aWeight < 0 && bWeight < 0) {
            return a.title > b.title ? 1 : -1;
        }
        if (aWeight < 0) {
            return 1;
        }
        if (bWeight < 0) {
            return -1;
        }
        return aWeight - bWeight;
    };
    CategoryPlugin.WEIGHTS = [];
    CategoryPlugin = CategoryPlugin_1 = __decorate([
        components_1.Component({ name: 'category' })
    ], CategoryPlugin);
    return CategoryPlugin;
    var CategoryPlugin_1;
}(components_1.ConverterComponent));
exports.CategoryPlugin = CategoryPlugin;
//# sourceMappingURL=CategoryPlugin.js.map