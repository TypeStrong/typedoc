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
var index_1 = require("../../models/reflections/index");
var index_2 = require("../../models/types/index");
var components_1 = require("../components");
var converter_1 = require("../converter");
var ImplementsPlugin = (function (_super) {
    __extends(ImplementsPlugin, _super);
    function ImplementsPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImplementsPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, converter_1.Converter.EVENT_RESOLVE, this.onResolve, -10);
    };
    ImplementsPlugin.prototype.analyzeClass = function (context, classReflection, interfaceReflection) {
        var _this = this;
        if (!interfaceReflection.children) {
            return;
        }
        interfaceReflection.children.forEach(function (interfaceMember) {
            if (!(interfaceMember instanceof index_1.DeclarationReflection)) {
                return;
            }
            var classMember;
            if (!classReflection.children) {
                return;
            }
            for (var index = 0, count = classReflection.children.length; index < count; index++) {
                var child = classReflection.children[index];
                if (child.name !== interfaceMember.name) {
                    continue;
                }
                if (child.flags.isStatic !== interfaceMember.flags.isStatic) {
                    continue;
                }
                classMember = child;
                break;
            }
            if (!classMember) {
                return;
            }
            var interfaceMemberName = interfaceReflection.name + '.' + interfaceMember.name;
            classMember.implementationOf = new index_2.ReferenceType(interfaceMemberName, index_2.ReferenceType.SYMBOL_ID_RESOLVED, interfaceMember);
            _this.copyComment(classMember, interfaceMember);
            if (interfaceMember.kindOf(index_1.ReflectionKind.FunctionOrMethod) && interfaceMember.signatures && classMember.signatures) {
                interfaceMember.signatures.forEach(function (interfaceSignature) {
                    var interfaceParameters = interfaceSignature.getParameterTypes();
                    classMember.signatures.forEach(function (classSignature) {
                        if (index_2.Type.isTypeListEqual(interfaceParameters, classSignature.getParameterTypes())) {
                            classSignature.implementationOf = new index_2.ReferenceType(interfaceMemberName, index_2.ReferenceType.SYMBOL_ID_RESOLVED, interfaceSignature);
                            _this.copyComment(classSignature, interfaceSignature);
                        }
                    });
                });
            }
        });
    };
    ImplementsPlugin.prototype.copyComment = function (target, source) {
        if (target.comment && source.comment && target.comment.hasTag('inheritdoc')) {
            target.comment.copyFrom(source.comment);
            if (target instanceof index_1.SignatureReflection && target.parameters &&
                source instanceof index_1.SignatureReflection && source.parameters) {
                for (var index = 0, count = target.parameters.length; index < count; index++) {
                    if (target.parameters[index].comment) {
                        target.parameters[index].comment.copyFrom(source.parameters[index].comment);
                    }
                }
            }
        }
    };
    ImplementsPlugin.prototype.onResolve = function (context, reflection) {
        var _this = this;
        if (reflection.kindOf(index_1.ReflectionKind.Class) && reflection.implementedTypes) {
            reflection.implementedTypes.forEach(function (type) {
                if (!(type instanceof index_2.ReferenceType)) {
                    return;
                }
                var source = type.reflection;
                if (source && source.kindOf(index_1.ReflectionKind.Interface)) {
                    _this.analyzeClass(context, reflection, source);
                }
            });
        }
    };
    ImplementsPlugin = __decorate([
        components_1.Component({ name: 'implements' })
    ], ImplementsPlugin);
    return ImplementsPlugin;
}(components_1.ConverterComponent));
exports.ImplementsPlugin = ImplementsPlugin;
//# sourceMappingURL=ImplementsPlugin.js.map