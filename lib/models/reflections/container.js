"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstract_1 = require("./abstract");
var ContainerReflection = (function (_super) {
    __extends(ContainerReflection, _super);
    function ContainerReflection() {
        _super.apply(this, arguments);
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
            this.children.forEach(function (child) {
                callback(child, abstract_1.TraverseProperty.Children);
            });
        }
    };
    ContainerReflection.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        if (this.groups) {
            var groups = [];
            this.groups.forEach(function (group) {
                groups.push(group.toObject());
            });
            result['groups'] = groups;
        }
        if (this.sources) {
            var sources = [];
            this.sources.forEach(function (source) {
                sources.push({
                    fileName: source.fileName,
                    line: source.line,
                    character: source.character
                });
            });
            result['sources'] = sources;
        }
        return result;
    };
    return ContainerReflection;
}(abstract_1.Reflection));
exports.ContainerReflection = ContainerReflection;
//# sourceMappingURL=container.js.map