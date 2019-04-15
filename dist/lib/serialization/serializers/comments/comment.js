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
let CommentSerializer = class CommentSerializer extends components_1.SerializerComponent {
    constructor() {
        super(...arguments);
        this.serializeGroupSymbol = models_1.Comment;
    }
    serializeGroup(instance) {
        return instance instanceof models_1.Comment;
    }
    supports(t) {
        return true;
    }
    toObject(comment, obj) {
        obj = obj || {};
        if (comment.shortText) {
            obj.shortText = comment.shortText;
        }
        if (comment.text) {
            obj.text = comment.text;
        }
        if (comment.returns) {
            obj.returns = comment.returns;
        }
        if (comment.tags && comment.tags.length) {
            obj.tags = [];
            comment.tags.forEach((tag) => obj.tags.push(this.owner.toObject(tag)));
        }
        return obj;
    }
};
CommentSerializer.PRIORITY = 1000;
CommentSerializer = __decorate([
    component_1.Component({ name: 'serializer:comment' })
], CommentSerializer);
exports.CommentSerializer = CommentSerializer;
//# sourceMappingURL=comment.js.map