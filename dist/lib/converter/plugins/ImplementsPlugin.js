"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../models/reflections/index");
const index_2 = require("../../models/types/index");
const components_1 = require("../components");
const converter_1 = require("../converter");
let ImplementsPlugin = class ImplementsPlugin extends components_1.ConverterComponent {
    initialize() {
        this.listenTo(this.owner, converter_1.Converter.EVENT_RESOLVE, this.onResolve, -10);
    }
    analyzeClass(context, classReflection, interfaceReflection) {
        if (!interfaceReflection.children) {
            return;
        }
        interfaceReflection.children.forEach((interfaceMember) => {
            if (!(interfaceMember instanceof index_1.DeclarationReflection)) {
                return;
            }
            let classMember;
            if (!classReflection.children) {
                return;
            }
            for (let index = 0, count = classReflection.children.length; index < count; index++) {
                const child = classReflection.children[index];
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
            const interfaceMemberName = interfaceReflection.name + '.' + interfaceMember.name;
            classMember.implementationOf = new index_2.ReferenceType(interfaceMemberName, index_2.ReferenceType.SYMBOL_ID_RESOLVED, interfaceMember);
            this.copyComment(classMember, interfaceMember);
            if (interfaceMember.kindOf(index_1.ReflectionKind.FunctionOrMethod) && interfaceMember.signatures && classMember.signatures) {
                interfaceMember.signatures.forEach((interfaceSignature) => {
                    const interfaceParameters = interfaceSignature.getParameterTypes();
                    (classMember.signatures || []).forEach((classSignature) => {
                        if (index_2.Type.isTypeListEqual(interfaceParameters, classSignature.getParameterTypes())) {
                            classSignature.implementationOf = new index_2.ReferenceType(interfaceMemberName, index_2.ReferenceType.SYMBOL_ID_RESOLVED, interfaceSignature);
                            this.copyComment(classSignature, interfaceSignature);
                        }
                    });
                });
            }
        });
    }
    copyComment(target, source) {
        if (target.comment && source.comment && target.comment.hasTag('inheritdoc')) {
            target.comment.copyFrom(source.comment);
            if (target instanceof index_1.SignatureReflection && target.parameters &&
                source instanceof index_1.SignatureReflection && source.parameters) {
                for (let index = 0, count = target.parameters.length; index < count; index++) {
                    if (target.parameters[index].comment) {
                        target.parameters[index].comment.copyFrom(source.parameters[index].comment);
                    }
                }
            }
        }
    }
    onResolve(context, reflection) {
        if (reflection.kindOf(index_1.ReflectionKind.Class) && reflection.implementedTypes) {
            reflection.implementedTypes.forEach((type) => {
                if (!(type instanceof index_2.ReferenceType)) {
                    return;
                }
                if (type.reflection && type.reflection.kindOf(index_1.ReflectionKind.Interface)) {
                    this.analyzeClass(context, reflection, type.reflection);
                }
            });
        }
    }
};
ImplementsPlugin = __decorate([
    components_1.Component({ name: 'implements' })
], ImplementsPlugin);
exports.ImplementsPlugin = ImplementsPlugin;
//# sourceMappingURL=ImplementsPlugin.js.map