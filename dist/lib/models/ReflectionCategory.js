"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReflectionCategory {
    constructor(title) {
        this.children = [];
        this.title = title;
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
            title: this.title
        };
        if (this.children) {
            const children = [];
            this.children.forEach((child) => {
                children.push(child.id);
            });
            result['children'] = children;
        }
        return result;
    }
}
exports.ReflectionCategory = ReflectionCategory;
//# sourceMappingURL=ReflectionCategory.js.map