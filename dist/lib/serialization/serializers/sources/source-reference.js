"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../../../utils/component");
const components_1 = require("../../components");
const source_reference_wrapper_1 = require("../models/source-reference-wrapper");
let SourceReferenceContainerSerializer = class SourceReferenceContainerSerializer extends components_1.SerializerComponent {
    constructor() {
        super(...arguments);
        this.serializeGroupSymbol = source_reference_wrapper_1.SourceReferenceWrapper;
    }
    serializeGroup(instance) {
        return instance instanceof source_reference_wrapper_1.SourceReferenceWrapper;
    }
    supports(t) {
        return t instanceof source_reference_wrapper_1.SourceReferenceWrapper;
    }
    toObject(sourceReferenceContainer, obj) {
        obj = obj || {};
        const sourceReference = sourceReferenceContainer.sourceReference;
        obj.fileName = sourceReference.fileName;
        obj.line = sourceReference.line;
        obj.character = sourceReference.character;
        return obj;
    }
};
SourceReferenceContainerSerializer.PRIORITY = 1000;
SourceReferenceContainerSerializer = __decorate([
    component_1.Component({ name: 'serializer:source-reference-container' })
], SourceReferenceContainerSerializer);
exports.SourceReferenceContainerSerializer = SourceReferenceContainerSerializer;
//# sourceMappingURL=source-reference.js.map