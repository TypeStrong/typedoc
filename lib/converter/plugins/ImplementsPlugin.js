var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Converter_1 = require("../Converter");
var ConverterPlugin_1 = require("../ConverterPlugin");
var DeclarationReflection_1 = require("../../models/reflections/DeclarationReflection");
var Type_1 = require("../../models/Type");
var Reflection_1 = require("../../models/Reflection");
var ReferenceType_1 = require("../../models/types/ReferenceType");
var SignatureReflection_1 = require("../../models/reflections/SignatureReflection");
var ImplementsPlugin = (function (_super) {
    __extends(ImplementsPlugin, _super);
    function ImplementsPlugin(converter) {
        _super.call(this, converter);
        converter.on(Converter_1.Converter.EVENT_RESOLVE, this.onResolve, this, -10);
    }
    ImplementsPlugin.prototype.analyzeClass = function (context, classReflection, interfaceReflection) {
        var _this = this;
        if (!interfaceReflection.children) {
            return;
        }
        interfaceReflection.children.forEach(function (interfaceMember) {
            if (!(interfaceMember instanceof DeclarationReflection_1.DeclarationReflection)) {
                return;
            }
            var classMember;
            for (var index = 0, count = classReflection.children.length; index < count; index++) {
                var child = classReflection.children[index];
                if (child.name != interfaceMember.name)
                    continue;
                if (child.flags.isStatic != interfaceMember.flags.isStatic)
                    continue;
                classMember = child;
                break;
            }
            if (!classMember) {
                return;
            }
            var interfaceMemberName = interfaceReflection.name + '.' + interfaceMember.name;
            classMember.implementationOf = new ReferenceType_1.ReferenceType(interfaceMemberName, ReferenceType_1.ReferenceType.SYMBOL_ID_RESOLVED, interfaceMember);
            _this.copyComment(classMember, interfaceMember);
            if (interfaceMember.kindOf(Reflection_1.ReflectionKind.FunctionOrMethod) && interfaceMember.signatures && classMember.signatures) {
                interfaceMember.signatures.forEach(function (interfaceSignature) {
                    var interfaceParameters = interfaceSignature.getParameterTypes();
                    classMember.signatures.forEach(function (classSignature) {
                        if (Type_1.Type.isTypeListEqual(interfaceParameters, classSignature.getParameterTypes())) {
                            classSignature.implementationOf = new ReferenceType_1.ReferenceType(interfaceMemberName, ReferenceType_1.ReferenceType.SYMBOL_ID_RESOLVED, interfaceSignature);
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
            if (target instanceof SignatureReflection_1.SignatureReflection && target.parameters &&
                source instanceof SignatureReflection_1.SignatureReflection && source.parameters) {
                for (var index = 0, count = target.parameters.length; index < count; index++) {
                    target.parameters[index].comment.copyFrom(source.parameters[index].comment);
                }
            }
        }
    };
    ImplementsPlugin.prototype.onResolve = function (context, reflection) {
        var _this = this;
        if (reflection.kindOf(Reflection_1.ReflectionKind.Class) && reflection.implementedTypes) {
            reflection.implementedTypes.forEach(function (type) {
                if (!(type instanceof ReferenceType_1.ReferenceType)) {
                    return;
                }
                var source = type.reflection;
                if (source && source.kindOf(Reflection_1.ReflectionKind.Interface)) {
                    _this.analyzeClass(context, reflection, source);
                }
            });
        }
    };
    return ImplementsPlugin;
})(ConverterPlugin_1.ConverterPlugin);
exports.ImplementsPlugin = ImplementsPlugin;
Converter_1.Converter.registerPlugin('implements', ImplementsPlugin);
