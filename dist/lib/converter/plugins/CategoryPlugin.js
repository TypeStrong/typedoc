"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var CategoryPlugin_1;
const models_1 = require("../../models");
const ReflectionCategory_1 = require("../../models/ReflectionCategory");
const components_1 = require("../components");
const converter_1 = require("../converter");
const component_1 = require("../../utils/component");
const declaration_1 = require("../../utils/options/declaration");
let CategoryPlugin = CategoryPlugin_1 = class CategoryPlugin extends components_1.ConverterComponent {
    initialize() {
        this.listenTo(this.owner, {
            [converter_1.Converter.EVENT_BEGIN]: this.onBegin,
            [converter_1.Converter.EVENT_RESOLVE]: this.onResolve,
            [converter_1.Converter.EVENT_RESOLVE_END]: this.onEndResolve
        }, undefined, -200);
    }
    onBegin(context) {
        if (this.defaultCategory) {
            CategoryPlugin_1.defaultCategory = this.defaultCategory;
        }
        if (this.categoryOrder) {
            CategoryPlugin_1.WEIGHTS = this.categoryOrder;
        }
    }
    onResolve(context, reflection) {
        if (reflection instanceof models_1.ContainerReflection) {
            this.categorize(reflection);
        }
    }
    onEndResolve(context) {
        const project = context.project;
        this.categorize(project);
    }
    categorize(obj) {
        if (this.categorizeByGroup) {
            this.groupCategorize(obj);
        }
        else {
            this.lumpCategorize(obj);
        }
    }
    groupCategorize(obj) {
        if (!obj.groups || obj.groups.length === 0) {
            return;
        }
        obj.groups.forEach((group) => {
            group.categories = CategoryPlugin_1.getReflectionCategories(group.children);
            if (group.categories && group.categories.length > 1) {
                group.categories.sort(CategoryPlugin_1.sortCatCallback);
            }
            else if (group.categories.length === 1 && group.categories[0].title === CategoryPlugin_1.defaultCategory) {
                group.categories = undefined;
            }
        });
    }
    lumpCategorize(obj) {
        if (obj instanceof models_1.ContainerReflection) {
            if (obj.children && obj.children.length > 0) {
                obj.categories = CategoryPlugin_1.getReflectionCategories(obj.children);
            }
            if (obj.categories && obj.categories.length > 1) {
                obj.categories.sort(CategoryPlugin_1.sortCatCallback);
            }
        }
    }
    static getReflectionCategories(reflections) {
        const categories = [];
        let defaultCat;
        reflections.forEach((child) => {
            const childCat = CategoryPlugin_1.getCategory(child);
            if (childCat === '') {
                if (!defaultCat) {
                    defaultCat = categories.find(category => category.title === CategoryPlugin_1.defaultCategory);
                    if (!defaultCat) {
                        defaultCat = new ReflectionCategory_1.ReflectionCategory(CategoryPlugin_1.defaultCategory);
                        categories.push(defaultCat);
                    }
                }
                defaultCat.children.push(child);
                return;
            }
            let category = categories.find(cat => cat.title === childCat);
            if (category) {
                category.children.push(child);
                return;
            }
            category = new ReflectionCategory_1.ReflectionCategory(childCat);
            category.children.push(child);
            categories.push(category);
        });
        return categories;
    }
    static getCategory(reflection) {
        function extractCategoryTag(comment) {
            const tags = comment.tags;
            if (tags) {
                for (let i = 0; i < tags.length; i++) {
                    if (tags[i].tagName === 'category') {
                        let tag = tags[i].text;
                        return tag.trim();
                    }
                }
            }
            return '';
        }
        let category = '';
        if (reflection.comment) {
            category = extractCategoryTag(reflection.comment);
        }
        else if (reflection instanceof models_1.DeclarationReflection && reflection.signatures) {
            reflection.signatures.forEach(sig => {
                if (sig.comment && category === '') {
                    category = extractCategoryTag(sig.comment);
                }
            });
        }
        return category;
    }
    static sortCatCallback(a, b) {
        let aWeight = CategoryPlugin_1.WEIGHTS.indexOf(a.title);
        let bWeight = CategoryPlugin_1.WEIGHTS.indexOf(b.title);
        if (aWeight === -1 || bWeight === -1) {
            let asteriskIndex = CategoryPlugin_1.WEIGHTS.indexOf('*');
            if (asteriskIndex === -1) {
                asteriskIndex = CategoryPlugin_1.WEIGHTS.length;
            }
            if (aWeight === -1) {
                aWeight = asteriskIndex;
            }
            if (bWeight === -1) {
                bWeight = asteriskIndex;
            }
        }
        if (aWeight === bWeight) {
            return a.title > b.title ? 1 : -1;
        }
        return aWeight - bWeight;
    }
};
CategoryPlugin.defaultCategory = 'Other';
CategoryPlugin.WEIGHTS = [];
__decorate([
    component_1.Option({
        name: 'defaultCategory',
        help: 'Specifies the default category for reflections without a category.',
        type: declaration_1.ParameterType.String,
        defaultValue: 'Other'
    })
], CategoryPlugin.prototype, "defaultCategory", void 0);
__decorate([
    component_1.Option({
        name: 'categoryOrder',
        help: 'Specifies the order in which categories appear. * indicates the relative order for categories not in the list.',
        type: declaration_1.ParameterType.Array
    })
], CategoryPlugin.prototype, "categoryOrder", void 0);
__decorate([
    component_1.Option({
        name: 'categorizeByGroup',
        help: 'Specifies whether categorization will be done at the group level.',
        type: declaration_1.ParameterType.Boolean,
        defaultValue: true
    })
], CategoryPlugin.prototype, "categorizeByGroup", void 0);
CategoryPlugin = CategoryPlugin_1 = __decorate([
    components_1.Component({ name: 'category' })
], CategoryPlugin);
exports.CategoryPlugin = CategoryPlugin;
//# sourceMappingURL=CategoryPlugin.js.map