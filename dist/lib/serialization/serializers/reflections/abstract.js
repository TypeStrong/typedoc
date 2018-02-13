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
var ReflectionSerializer = (function (_super) {
    __extends(ReflectionSerializer, _super);
    function ReflectionSerializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReflectionSerializer.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.supports = function (r) { return true; };
    };
    ReflectionSerializer.prototype.toObject = function (reflection, obj) {
        var _this = this;
        obj = obj || {};
        Object.assign(obj, {
            id: reflection.id,
            name: reflection.name,
            kind: reflection.kind,
            kindString: reflection.kindString,
            flags: {}
        });
        if (reflection.originalName !== reflection.name) {
            obj.originalName = reflection.originalName;
        }
        if (reflection.comment) {
            obj.comment = this.owner.toObject(reflection.comment);
        }
        for (var key in reflection.flags) {
            if (parseInt(key, 10) == key || key === 'flags') {
                continue;
            }
            if (reflection.flags[key]) {
                obj.flags[key] = true;
            }
        }
        if (reflection.decorates && reflection.decorates.length > 0) {
            obj.decorates = reflection.decorates.map(function (t) { return _this.owner.toObject(t); });
        }
        if (reflection.decorators && reflection.decorators.length > 0) {
            obj.decorators = reflection.decorators.map(function (d) { return _this.owner.toObject(new models_2.DecoratorWrapper(d)); });
        }
        reflection.traverse(function (child, property) {
            if (property === models_1.TraverseProperty.TypeLiteral) {
                return;
            }
            var name = models_1.TraverseProperty[property];
            name = name.substr(0, 1).toLowerCase() + name.substr(1);
            switch (property) {
                case models_1.TraverseProperty.GetSignature:
                case models_1.TraverseProperty.SetSignature:
                case models_1.TraverseProperty.IndexSignature:
                    obj[name] = _this.owner.toObject(child);
                    break;
                default:
                    if (!obj[name]) {
                        obj[name] = [];
                    }
                    obj[name].push(_this.owner.toObject(child));
                    break;
            }
        });
        return obj;
    };
    ReflectionSerializer.PRIORITY = 1000;
    ReflectionSerializer = __decorate([
        component_1.Component({ name: 'serializer:reflection' })
    ], ReflectionSerializer);
    return ReflectionSerializer;
}(components_1.ReflectionSerializerComponent));
exports.ReflectionSerializer = ReflectionSerializer;
//# sourceMappingURL=abstract.js.map