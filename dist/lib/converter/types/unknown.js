"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../models/types/index");
const components_1 = require("../components");
let UnknownConverter = class UnknownConverter extends components_1.ConverterTypeComponent {
    constructor() {
        super(...arguments);
        this.priority = -100;
    }
    supportsType(context, type) {
        return true;
    }
    convertType(context, type) {
        const name = context.checker.typeToString(type);
        return new index_1.UnknownType(name);
    }
};
UnknownConverter = __decorate([
    components_1.Component({ name: 'type:unknown' })
], UnknownConverter);
exports.UnknownConverter = UnknownConverter;
//# sourceMappingURL=unknown.js.map