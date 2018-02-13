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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../../../utils/component");
var models_1 = require("../../../models");
var components_1 = require("../../components");
var CommentSerializer = (function (_super) {
    __extends(CommentSerializer, _super);
    function CommentSerializer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.serializeGroup = CommentSerializer_1.serializeGroup;
        _this.serializeGroupSymbol = models_1.Comment;
        return _this;
    }
    CommentSerializer_1 = CommentSerializer;
    CommentSerializer.serializeGroup = function (instance) {
        return instance instanceof models_1.Comment;
    };
    CommentSerializer.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.supports = function (r) { return true; };
    };
    CommentSerializer.prototype.toObject = function (comment, obj) {
        var _this = this;
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
            comment.tags.forEach(function (tag) { return obj.tags.push(_this.owner.toObject(tag)); });
        }
        return obj;
    };
    CommentSerializer.PRIORITY = 1000;
    CommentSerializer = CommentSerializer_1 = __decorate([
        component_1.Component({ name: 'serializer:comment' })
    ], CommentSerializer);
    return CommentSerializer;
    var CommentSerializer_1;
}(components_1.SerializerComponent));
exports.CommentSerializer = CommentSerializer;
//# sourceMappingURL=comment.js.map