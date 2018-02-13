"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReflectionCategory = (function () {
    function ReflectionCategory(title) {
        var _this = this;
        this.children = [];
        this.title = title;
        this.allChildrenHaveOwnDocument = (function () { return _this.getAllChildrenHaveOwnDocument(); });
    }
    ReflectionCategory.prototype.getAllChildrenHaveOwnDocument = function () {
        var onlyOwnDocuments = true;
        this.children.forEach(function (child) {
            onlyOwnDocuments = onlyOwnDocuments && child.hasOwnDocument;
        });
        return onlyOwnDocuments;
    };
    ReflectionCategory.prototype.toObject = function () {
        var result = {
            title: this.title
        };
        if (this.children) {
            var children_1 = [];
            this.children.forEach(function (child) {
                children_1.push(child.id);
            });
            result['children'] = children_1;
        }
        return result;
    };
    return ReflectionCategory;
}());
exports.ReflectionCategory = ReflectionCategory;
//# sourceMappingURL=ReflectionCategory.js.map