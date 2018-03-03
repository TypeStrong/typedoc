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
var CommentTagSerializer = (function (_super) {
    __extends(CommentTagSerializer, _super);
    function CommentTagSerializer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.serializeGroup = CommentTagSerializer_1.serializeGroup;
        _this.serializeGroupSymbol = models_1.CommentTag;
        return _this;
    }
    CommentTagSerializer_1 = CommentTagSerializer;
    CommentTagSerializer.serializeGroup = function (instance) {
        return instance instanceof models_1.CommentTag;
    };
    CommentTagSerializer.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.supports = function (r) { return true; };
    };
    CommentTagSerializer.prototype.toObject = function (tag, obj) {
        obj = obj || {};
        obj.tag = tag.tagName;
        obj.text = tag.text;
        if (tag.paramName) {
            obj.param = tag.paramName;
        }
        return obj;
    };
    CommentTagSerializer.PRIORITY = 1000;
    CommentTagSerializer = CommentTagSerializer_1 = __decorate([
        component_1.Component({ name: 'serializer:comment-tag' })
    ], CommentTagSerializer);
    return CommentTagSerializer;
    var CommentTagSerializer_1;
}(components_1.SerializerComponent));
exports.CommentTagSerializer = CommentTagSerializer;
//# sourceMappingURL=comment-tag.js.map