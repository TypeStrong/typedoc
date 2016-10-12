"use strict";
var ReflectionGroup = (function () {
    function ReflectionGroup(title, kind) {
        var _this = this;
        this.children = [];
        this.title = title;
        this.kind = kind;
        this.allChildrenHaveOwnDocument = (function () { return _this.getAllChildrenHaveOwnDocument(); });
    }
    ReflectionGroup.prototype.getAllChildrenHaveOwnDocument = function () {
        var onlyOwnDocuments = true;
        this.children.forEach(function (child) {
            onlyOwnDocuments = onlyOwnDocuments && child.hasOwnDocument;
        });
        return onlyOwnDocuments;
    };
    ReflectionGroup.prototype.toObject = function () {
        var result = {
            title: this.title,
            kind: this.kind
        };
        if (this.children) {
            var children = [];
            this.children.forEach(function (child) {
                children.push(child.id);
            });
            result['children'] = children;
        }
        return result;
    };
    return ReflectionGroup;
}());
exports.ReflectionGroup = ReflectionGroup;
//# sourceMappingURL=ReflectionGroup.js.map