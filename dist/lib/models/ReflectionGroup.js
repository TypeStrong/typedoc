"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReflectionGroup {
    constructor(title, kind) {
        this.children = [];
        this.title = title;
        this.kind = kind;
        this.allChildrenHaveOwnDocument = (() => this.getAllChildrenHaveOwnDocument());
    }
    getAllChildrenHaveOwnDocument() {
        let onlyOwnDocuments = true;
        this.children.forEach((child) => {
            onlyOwnDocuments = onlyOwnDocuments && !!child.hasOwnDocument;
        });
        return onlyOwnDocuments;
    }
    toObject() {
        const result = {
            title: this.title,
            kind: this.kind
        };
        if (this.children) {
            const children = [];
            this.children.forEach((child) => {
                children.push(child.id);
            });
            result['children'] = children;
        }
        if (this.categories) {
            const categories = [];
            this.categories.forEach((category) => {
                categories.push(category.toObject());
            });
            result['categories'] = categories;
        }
        return result;
    }
}
exports.ReflectionGroup = ReflectionGroup;
//# sourceMappingURL=ReflectionGroup.js.map