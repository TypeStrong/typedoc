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
let TypePlugin = class TypePlugin extends components_1.ConverterComponent {
    constructor() {
        super(...arguments);
        this.reflections = [];
    }
    initialize() {
        this.listenTo(this.owner, {
            [converter_1.Converter.EVENT_RESOLVE]: this.onResolve,
            [converter_1.Converter.EVENT_RESOLVE_END]: this.onResolveEnd
        });
    }
    onResolve(context, reflection) {
        const project = context.project;
        resolveType(reflection, reflection.type);
        resolveType(reflection, reflection.inheritedFrom);
        resolveType(reflection, reflection.overwrites);
        resolveTypes(reflection, reflection.extendedTypes);
        resolveTypes(reflection, reflection.extendedBy);
        resolveTypes(reflection, reflection.implementedTypes);
        if (reflection.decorators) {
            reflection.decorators.forEach((decorator) => {
                if (decorator.type) {
                    resolveType(reflection, decorator.type);
                }
            });
        }
        if (reflection.kindOf(index_1.ReflectionKind.ClassOrInterface)) {
            this.postpone(reflection);
            walk(reflection.implementedTypes, (target) => {
                this.postpone(target);
                if (!target.implementedBy) {
                    target.implementedBy = [];
                }
                target.implementedBy.push(new index_2.ReferenceType(reflection.name, index_2.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
            });
            walk(reflection.extendedTypes, (target) => {
                this.postpone(target);
                if (!target.extendedBy) {
                    target.extendedBy = [];
                }
                target.extendedBy.push(new index_2.ReferenceType(reflection.name, index_2.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
            });
        }
        function walk(types, callback) {
            if (!types) {
                return;
            }
            types.forEach(type => {
                if (!(type instanceof index_2.ReferenceType)) {
                    return;
                }
                if (!type.reflection || !(type.reflection instanceof index_1.DeclarationReflection)) {
                    return;
                }
                callback(type.reflection);
            });
        }
        function resolveTypes(reflection, types) {
            if (!types) {
                return;
            }
            for (let i = 0, c = types.length; i < c; i++) {
                resolveType(reflection, types[i]);
            }
        }
        function resolveType(reflection, type) {
            if (type instanceof index_2.ReferenceType) {
                if (type.symbolID === index_2.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME) {
                    type.reflection = reflection.findReflectionByName(type.name);
                }
                else if (!type.reflection && type.symbolID !== index_2.ReferenceType.SYMBOL_ID_RESOLVED) {
                    type.reflection = project.reflections[project.symbolMapping[type.symbolID]];
                }
                if (type.typeArguments) {
                    resolveTypes(reflection, type.typeArguments);
                }
            }
            else if (type instanceof index_2.TupleType) {
                resolveTypes(reflection, type.elements);
            }
            else if (type instanceof index_2.UnionType || type instanceof index_2.IntersectionType) {
                resolveTypes(reflection, type.types);
            }
            else if (type instanceof index_2.ArrayType) {
                resolveType(reflection, type.elementType);
            }
        }
    }
    postpone(reflection) {
        if (!this.reflections.includes(reflection)) {
            this.reflections.push(reflection);
        }
    }
    onResolveEnd(context) {
        this.reflections.forEach((reflection) => {
            if (reflection.implementedBy) {
                reflection.implementedBy.sort((a, b) => {
                    if (a['name'] === b['name']) {
                        return 0;
                    }
                    return a['name'] > b['name'] ? 1 : -1;
                });
            }
            let root;
            let hierarchy;
            function push(types) {
                const level = { types: types };
                if (hierarchy) {
                    hierarchy.next = level;
                    hierarchy = level;
                }
                else {
                    root = hierarchy = level;
                }
            }
            if (reflection.extendedTypes) {
                push(reflection.extendedTypes);
            }
            push([new index_2.ReferenceType(reflection.name, index_2.ReferenceType.SYMBOL_ID_RESOLVED, reflection)]);
            hierarchy.isTarget = true;
            if (reflection.extendedBy) {
                push(reflection.extendedBy);
            }
            reflection.typeHierarchy = root;
        });
    }
};
TypePlugin = __decorate([
    components_1.Component({ name: 'type' })
], TypePlugin);
exports.TypePlugin = TypePlugin;
//# sourceMappingURL=TypePlugin.js.map