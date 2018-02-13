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
var models_2 = require("../models");
var ContainerReflectionSerializer = (function (_super) {
    __extends(ContainerReflectionSerializer, _super);
    function ContainerReflectionSerializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContainerReflectionSerializer.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.supports = function (r) { return r instanceof models_1.ContainerReflection; };
    };
    ContainerReflectionSerializer.prototype.toObject = function (container, obj) {
        var _this = this;
        obj = obj || {};
        if (container.groups && container.groups.length > 0) {
            obj.groups = container.groups.map(function (group) { return _this.owner.toObject(group); });
        }
        if (container.sources && container.sources.length > 0) {
            obj.sources = container.sources
                .map(function (source) { return _this.owner
                .toObject(new models_2.SourceReferenceWrapper({
                fileName: source.fileName,
                line: source.line,
                character: source.character
            })); });
        }
        return obj;
    };
    ContainerReflectionSerializer = __decorate([
        component_1.Component({ name: 'serializer:container-reflection' })
    ], ContainerReflectionSerializer);
    return ContainerReflectionSerializer;
}(components_1.ReflectionSerializerComponent));
exports.ContainerReflectionSerializer = ContainerReflectionSerializer;
//# sourceMappingURL=container.js.map