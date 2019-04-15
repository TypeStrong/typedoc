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
let TupleConverter = class TupleConverter extends components_1.ConverterTypeComponent {
    supportsNode(context, node) {
        return node.kind === ts.SyntaxKind.TupleType;
    }
    supportsType(context, type) {
        if (type.objectFlags & ts.ObjectFlags.Tuple) {
            return true;
        }
        if (type.objectFlags & ts.ObjectFlags.Reference) {
            if (type.target.objectFlags & ts.ObjectFlags.Tuple) {
                return true;
            }
        }
        return false;
    }
    convertNode(context, node) {
        const elements = this.owner.convertTypes(context, node.elementTypes);
        return new index_1.TupleType(elements);
    }
    convertType(context, type) {
        const elements = this.owner.convertTypes(context, undefined, type.typeArguments);
        return new index_1.TupleType(elements);
    }
};
TupleConverter = __decorate([
    components_1.Component({ name: 'type:tuple' })
], TupleConverter);
exports.TupleConverter = TupleConverter;
//# sourceMappingURL=tuple.js.map