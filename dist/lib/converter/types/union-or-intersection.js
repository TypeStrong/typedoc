"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const index_1 = require("../../models/types/index");
const components_1 = require("../components");
let UnionOrIntersectionConverter = class UnionOrIntersectionConverter extends components_1.ConverterTypeComponent {
    supportsNode(context, node) {
        return node.kind === ts.SyntaxKind.UnionType || node.kind === ts.SyntaxKind.IntersectionType;
    }
    supportsType(context, type) {
        return !!(type.flags & ts.TypeFlags.UnionOrIntersection) && !(type.flags & ts.TypeFlags.EnumLiteral);
    }
    convertNode(context, node) {
        const types = this.owner.convertTypes(context, node.types);
        return ts.isIntersectionTypeNode(node) ? new index_1.IntersectionType(types) : new index_1.UnionType(types);
    }
    convertType(context, type) {
        const types = this.owner.convertTypes(context, undefined, type.types);
        return type.flags & ts.TypeFlags.Intersection ? new index_1.IntersectionType(types) : new index_1.UnionType(types);
    }
};
UnionOrIntersectionConverter = __decorate([
    components_1.Component({ name: 'type:union-or-intersection' })
], UnionOrIntersectionConverter);
exports.UnionOrIntersectionConverter = UnionOrIntersectionConverter;
//# sourceMappingURL=union-or-intersection.js.map