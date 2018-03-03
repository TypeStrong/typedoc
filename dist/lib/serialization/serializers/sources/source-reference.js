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
var components_1 = require("../../components");
var source_reference_wrapper_1 = require("../models/source-reference-wrapper");
var SourceReferenceContainerSerializer = (function (_super) {
    __extends(SourceReferenceContainerSerializer, _super);
    function SourceReferenceContainerSerializer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.serializeGroup = function (instance) { return instance instanceof source_reference_wrapper_1.SourceReferenceWrapper; };
        _this.serializeGroupSymbol = source_reference_wrapper_1.SourceReferenceWrapper;
        return _this;
    }
    SourceReferenceContainerSerializer.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.supports = function (s) { return s instanceof source_reference_wrapper_1.SourceReferenceWrapper; };
    };
    SourceReferenceContainerSerializer.prototype.toObject = function (sourceReferenceContainer, obj) {
        obj = obj || {};
        var sourceReference = sourceReferenceContainer.sourceReference;
        obj.fileName = sourceReference.fileName;
        obj.line = sourceReference.line;
        obj.character = sourceReference.character;
        return obj;
    };
    SourceReferenceContainerSerializer.PRIORITY = 1000;
    SourceReferenceContainerSerializer = __decorate([
        component_1.Component({ name: 'serializer:source-reference-container' })
    ], SourceReferenceContainerSerializer);
    return SourceReferenceContainerSerializer;
}(components_1.SerializerComponent));
exports.SourceReferenceContainerSerializer = SourceReferenceContainerSerializer;
//# sourceMappingURL=source-reference.js.map