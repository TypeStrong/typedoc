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
var abstract_1 = require("./abstract");
var ContainerReflection = (function (_super) {
    __extends(ContainerReflection, _super);
    function ContainerReflection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContainerReflection.prototype.getChildrenByKind = function (kind) {
        var values = [];
        for (var key in this.children) {
            var child = this.children[key];
            if (child.kindOf(kind)) {
                values.push(child);
            }
        }
        return values;
    };
    ContainerReflection.prototype.traverse = function (callback) {
        if (this.children) {
            this.children.slice().forEach(function (child) {
                callback(child, abstract_1.TraverseProperty.Children);
            });
        }
    };
    ContainerReflection.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        if (this.groups) {
            var groups_1 = [];
            this.groups.forEach(function (group) {
                groups_1.push(group.toObject());
            });
            result['groups'] = groups_1;
        }
        if (this.categories) {
            var categories_1 = [];
            this.categories.forEach(function (category) {
                categories_1.push(category.toObject());
            });
            if (categories_1.length > 0) {
                result['categories'] = categories_1;
            }
        }
        if (this.sources) {
            var sources_1 = [];
            this.sources.forEach(function (source) {
                sources_1.push({
                    fileName: source.fileName,
                    line: source.line,
                    character: source.character
                });
            });
            result['sources'] = sources_1;
        }
        return result;
    };
    return ContainerReflection;
}(abstract_1.Reflection));
exports.ContainerReflection = ContainerReflection;
//# sourceMappingURL=container.js.map