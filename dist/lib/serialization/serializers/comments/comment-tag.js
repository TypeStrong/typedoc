"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../../../utils/component");
const models_1 = require("../../../models");
const components_1 = require("../../components");
let CommentTagSerializer = class CommentTagSerializer extends components_1.SerializerComponent {
    constructor() {
        super(...arguments);
        this.serializeGroupSymbol = models_1.CommentTag;
    }
    serializeGroup(instance) {
        return instance instanceof models_1.CommentTag;
    }
    supports(t) {
        return true;
    }
    toObject(tag, obj) {
        obj = obj || {};
        obj.tag = tag.tagName;
        obj.text = tag.text;
        if (tag.paramName) {
            obj.param = tag.paramName;
        }
        return obj;
    }
};
CommentTagSerializer.PRIORITY = 1000;
CommentTagSerializer = __decorate([
    component_1.Component({ name: 'serializer:comment-tag' })
], CommentTagSerializer);
exports.CommentTagSerializer = CommentTagSerializer;
//# sourceMappingURL=comment-tag.js.map