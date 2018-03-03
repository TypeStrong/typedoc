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
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../sources/index");
var abstract_1 = require("./abstract");
var container_1 = require("./container");
var ProjectReflection = (function (_super) {
    __extends(ProjectReflection, _super);
    function ProjectReflection(name) {
        var _this = _super.call(this, null, name, abstract_1.ReflectionKind.Global) || this;
        _this.reflections = {};
        _this.symbolMapping = {};
        _this.directory = new index_1.SourceDirectory();
        _this.files = [];
        return _this;
    }
    ProjectReflection.prototype.isProject = function () {
        return true;
    };
    ProjectReflection.prototype.getReflectionsByKind = function (kind) {
        var values = [];
        for (var id in this.reflections) {
            var reflection = this.reflections[id];
            if (reflection.kindOf(kind)) {
                values.push(reflection);
            }
        }
        return values;
    };
    ProjectReflection.prototype.findReflectionByName = function (arg) {
        var names = Array.isArray(arg) ? arg : arg.split('.');
        var name = names.pop();
        search: for (var key in this.reflections) {
            var reflection = this.reflections[key];
            if (reflection.name !== name) {
                continue;
            }
            var depth = names.length - 1;
            var target = reflection;
            while (target && depth >= 0) {
                target = target.parent;
                if (target.name !== names[depth]) {
                    continue search;
                }
                depth -= 1;
            }
            return reflection;
        }
        return null;
    };
    ProjectReflection.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        if (this.categories) {
            var categories_1 = [];
            this.categories.forEach(function (category) {
                categories_1.push(category.toObject());
            });
            if (categories_1.length > 0) {
                result['categories'] = categories_1;
            }
        }
        return result;
    };
    return ProjectReflection;
}(container_1.ContainerReflection));
exports.ProjectReflection = ProjectReflection;
//# sourceMappingURL=project.js.map