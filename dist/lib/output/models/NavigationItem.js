"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NavigationItem {
    constructor(title, url, parent, cssClasses, reflection) {
        this.title = title || '';
        this.url = url || '';
        this.parent = parent;
        this.cssClasses = cssClasses || '';
        this.reflection = reflection;
        if (!url) {
            this.isLabel = true;
        }
        if (this.parent) {
            if (!this.parent.children) {
                this.parent.children = [];
            }
            this.parent.children.push(this);
        }
    }
    static create(reflection, parent, useShortNames) {
        let name;
        if (useShortNames || (parent && parent.parent)) {
            name = reflection.name;
        }
        else {
            name = reflection.getFullName();
        }
        name = name.trim();
        if (name === '') {
            name = `<em>${reflection.kindString}</em>`;
        }
        return new NavigationItem(name, reflection.url, parent, reflection.cssClasses, reflection);
    }
}
exports.NavigationItem = NavigationItem;
//# sourceMappingURL=NavigationItem.js.map