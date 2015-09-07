var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Converter_1 = require("../Converter");
var ConverterPlugin_1 = require("../ConverterPlugin");
var DeclarationReflection_1 = require("../../models/reflections/DeclarationReflection");
var ReferenceType_1 = require("../../models/types/ReferenceType");
var Reflection_1 = require("../../models/Reflection");
var TupleType_1 = require("../../models/types/TupleType");
var UnionType_1 = require("../../models/types/UnionType");
var TypePlugin = (function (_super) {
    __extends(TypePlugin, _super);
    function TypePlugin(converter) {
        _super.call(this, converter);
        this.reflections = [];
        converter.on(Converter_1.Converter.EVENT_RESOLVE, this.onResolve, this);
        converter.on(Converter_1.Converter.EVENT_RESOLVE_END, this.onResolveEnd, this);
    }
    TypePlugin.prototype.onResolve = function (context, reflection) {
        var _this = this;
        var project = context.project;
        resolveType(reflection, reflection.type);
        resolveType(reflection, reflection.inheritedFrom);
        resolveType(reflection, reflection.overwrites);
        resolveTypes(reflection, reflection.extendedTypes);
        resolveTypes(reflection, reflection.extendedBy);
        resolveTypes(reflection, reflection.implementedTypes);
        if (reflection.decorators)
            reflection.decorators.forEach(function (decorator) {
                if (decorator.type) {
                    resolveType(reflection, decorator.type);
                }
            });
        if (reflection.kindOf(Reflection_1.ReflectionKind.ClassOrInterface)) {
            this.postpone(reflection);
            walk(reflection.implementedTypes, function (target) {
                _this.postpone(target);
                if (!target.implementedBy)
                    target.implementedBy = [];
                target.implementedBy.push(new ReferenceType_1.ReferenceType(reflection.name, ReferenceType_1.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
            });
            walk(reflection.extendedTypes, function (target) {
                _this.postpone(target);
                if (!target.extendedBy)
                    target.extendedBy = [];
                target.extendedBy.push(new ReferenceType_1.ReferenceType(reflection.name, ReferenceType_1.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
            });
        }
        function walk(types, callback) {
            if (!types)
                return;
            types.forEach(function (type) {
                if (!(type instanceof ReferenceType_1.ReferenceType))
                    return;
                if (!type.reflection || !(type.reflection instanceof DeclarationReflection_1.DeclarationReflection))
                    return;
                callback(type.reflection);
            });
        }
        function resolveTypes(reflection, types) {
            if (!types)
                return;
            for (var i = 0, c = types.length; i < c; i++) {
                resolveType(reflection, types[i]);
            }
        }
        function resolveType(reflection, type) {
            if (type instanceof ReferenceType_1.ReferenceType) {
                var referenceType = type;
                if (referenceType.symbolID == ReferenceType_1.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME) {
                    referenceType.reflection = reflection.findReflectionByName(referenceType.name);
                }
                else if (!referenceType.reflection && referenceType.symbolID != ReferenceType_1.ReferenceType.SYMBOL_ID_RESOLVED) {
                    referenceType.reflection = project.reflections[project.symbolMapping[referenceType.symbolID]];
                }
                if (referenceType.typeArguments) {
                    referenceType.typeArguments.forEach(function (typeArgument) {
                        resolveType(reflection, typeArgument);
                    });
                }
            }
            else if (type instanceof TupleType_1.TupleType) {
                var tupleType = type;
                for (var index = 0, count = tupleType.elements.length; index < count; index++) {
                    resolveType(reflection, tupleType.elements[index]);
                }
            }
            else if (type instanceof UnionType_1.UnionType) {
                var unionType = type;
                for (var index = 0, count = unionType.types.length; index < count; index++) {
                    resolveType(reflection, unionType.types[index]);
                }
            }
        }
    };
    TypePlugin.prototype.postpone = function (reflection) {
        if (this.reflections.indexOf(reflection) == -1) {
            this.reflections.push(reflection);
        }
    };
    TypePlugin.prototype.onResolveEnd = function (context) {
        this.reflections.forEach(function (reflection) {
            if (reflection.implementedBy) {
                reflection.implementedBy.sort(function (a, b) {
                    if (a['name'] == b['name'])
                        return 0;
                    return a['name'] > b['name'] ? 1 : -1;
                });
            }
            var root;
            var hierarchy;
            function push(types) {
                var level = { types: types };
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
            push([new ReferenceType_1.ReferenceType(reflection.name, ReferenceType_1.ReferenceType.SYMBOL_ID_RESOLVED, reflection)]);
            hierarchy.isTarget = true;
            if (reflection.extendedBy) {
                push(reflection.extendedBy);
            }
            reflection.typeHierarchy = root;
        });
    };
    return TypePlugin;
})(ConverterPlugin_1.ConverterPlugin);
exports.TypePlugin = TypePlugin;
Converter_1.Converter.registerPlugin('type', TypePlugin);
