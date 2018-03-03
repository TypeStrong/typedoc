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
var component_1 = require("../../utils/component");
var ReflectionGroup_1 = require("../../models/ReflectionGroup");
var components_1 = require("../components");
var ReflectionGroupSerializer = (function (_super) {
    __extends(ReflectionGroupSerializer, _super);
    function ReflectionGroupSerializer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.serializeGroup = ReflectionGroupSerializer_1.serializeGroup;
        _this.serializeGroupSymbol = ReflectionGroup_1.ReflectionGroup;
        return _this;
    }
    ReflectionGroupSerializer_1 = ReflectionGroupSerializer;
    ReflectionGroupSerializer.serializeGroup = function (instance) {
        return instance instanceof ReflectionGroup_1.ReflectionGroup;
    };
    ReflectionGroupSerializer.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.supports = function (r) { return r instanceof ReflectionGroup_1.ReflectionGroup; };
    };
    ReflectionGroupSerializer.prototype.toObject = function (group, obj) {
        obj = obj || {};
        Object.assign(obj, {
            title: group.title,
            kind: group.kind
        });
        if (group.children && group.children.length > 0) {
            obj.children = group.children.map(function (child) { return child.id; });
        }
        return obj;
    };
    ReflectionGroupSerializer.PRIORITY = 1000;
    ReflectionGroupSerializer = ReflectionGroupSerializer_1 = __decorate([
        component_1.Component({ name: 'serializer:reflection-group' })
    ], ReflectionGroupSerializer);
    return ReflectionGroupSerializer;
    var ReflectionGroupSerializer_1;
}(components_1.SerializerComponent));
exports.ReflectionGroupSerializer = ReflectionGroupSerializer;
//# sourceMappingURL=reflection-group.js.map