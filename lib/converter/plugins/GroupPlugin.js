var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Converter_1 = require("../Converter");
var ConverterPlugin_1 = require("../ConverterPlugin");
var Reflection_1 = require("../../models/Reflection");
var ReflectionGroup_1 = require("../../models/ReflectionGroup");
var ContainerReflection_1 = require("../../models/reflections/ContainerReflection");
var DeclarationReflection_1 = require("../../models/reflections/DeclarationReflection");
var GroupPlugin = (function (_super) {
    __extends(GroupPlugin, _super);
    function GroupPlugin(converter) {
        _super.call(this, converter);
        converter.on(Converter_1.Converter.EVENT_RESOLVE, this.onResolve, this);
        converter.on(Converter_1.Converter.EVENT_RESOLVE_END, this.onEndResolve, this);
    }
    GroupPlugin.prototype.onResolve = function (context, reflection) {
        var reflection = reflection;
        reflection.kindString = GroupPlugin.getKindSingular(reflection.kind);
        if (reflection instanceof ContainerReflection_1.ContainerReflection) {
            var container = reflection;
            if (container.children && container.children.length > 0) {
                container.children.sort(GroupPlugin.sortCallback);
                container.groups = GroupPlugin.getReflectionGroups(container.children);
            }
        }
    };
    GroupPlugin.prototype.onEndResolve = function (context) {
        function walkDirectory(directory) {
            directory.groups = GroupPlugin.getReflectionGroups(directory.getAllReflections());
            for (var key in directory.directories) {
                if (!directory.directories.hasOwnProperty(key))
                    continue;
                walkDirectory(directory.directories[key]);
            }
        }
        var project = context.project;
        if (project.children && project.children.length > 0) {
            project.children.sort(GroupPlugin.sortCallback);
            project.groups = GroupPlugin.getReflectionGroups(project.children);
        }
        walkDirectory(project.directory);
        project.files.forEach(function (file) {
            file.groups = GroupPlugin.getReflectionGroups(file.reflections);
        });
    };
    GroupPlugin.getReflectionGroups = function (reflections) {
        var groups = [];
        reflections.forEach(function (child) {
            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];
                if (group.kind != child.kind) {
                    continue;
                }
                group.children.push(child);
                return;
            }
            var group = new ReflectionGroup_1.ReflectionGroup(GroupPlugin.getKindPlural(child.kind), child.kind);
            group.children.push(child);
            groups.push(group);
        });
        groups.forEach(function (group) {
            var someExported = false, allInherited = true, allPrivate = true, allProtected = true, allExternal = true;
            group.children.forEach(function (child) {
                someExported = child.flags.isExported || someExported;
                allPrivate = child.flags.isPrivate && allPrivate;
                allProtected = (child.flags.isPrivate || child.flags.isProtected) && allProtected;
                allExternal = child.flags.isExternal && allExternal;
                if (child instanceof DeclarationReflection_1.DeclarationReflection) {
                    allInherited = child.inheritedFrom && allInherited;
                }
                else {
                    allInherited = false;
                }
            });
            group.someChildrenAreExported = someExported;
            group.allChildrenAreInherited = allInherited;
            group.allChildrenArePrivate = allPrivate;
            group.allChildrenAreProtectedOrPrivate = allProtected;
            group.allChildrenAreExternal = allExternal;
        });
        return groups;
    };
    GroupPlugin.getKindString = function (kind) {
        var str = Reflection_1.ReflectionKind[kind];
        str = str.replace(/(.)([A-Z])/g, function (m, a, b) { return a + ' ' + b.toLowerCase(); });
        return str;
    };
    GroupPlugin.getKindSingular = function (kind) {
        if (GroupPlugin.SINGULARS[kind]) {
            return GroupPlugin.SINGULARS[kind];
        }
        else {
            return GroupPlugin.getKindString(kind);
        }
    };
    GroupPlugin.getKindPlural = function (kind) {
        if (GroupPlugin.PLURALS[kind]) {
            return GroupPlugin.PLURALS[kind];
        }
        else {
            return this.getKindString(kind) + 's';
        }
    };
    GroupPlugin.sortCallback = function (a, b) {
        var aWeight = GroupPlugin.WEIGHTS.indexOf(a.kind);
        var bWeight = GroupPlugin.WEIGHTS.indexOf(b.kind);
        if (aWeight == bWeight) {
            if (a.flags.isStatic && !b.flags.isStatic)
                return 1;
            if (!a.flags.isStatic && b.flags.isStatic)
                return -1;
            if (a.name == b.name)
                return 0;
            return a.name > b.name ? 1 : -1;
        }
        else
            return aWeight - bWeight;
    };
    GroupPlugin.WEIGHTS = [
        Reflection_1.ReflectionKind.Global,
        Reflection_1.ReflectionKind.ExternalModule,
        Reflection_1.ReflectionKind.Module,
        Reflection_1.ReflectionKind.Enum,
        Reflection_1.ReflectionKind.EnumMember,
        Reflection_1.ReflectionKind.Class,
        Reflection_1.ReflectionKind.Interface,
        Reflection_1.ReflectionKind.TypeAlias,
        Reflection_1.ReflectionKind.Constructor,
        Reflection_1.ReflectionKind.Event,
        Reflection_1.ReflectionKind.Property,
        Reflection_1.ReflectionKind.Variable,
        Reflection_1.ReflectionKind.Function,
        Reflection_1.ReflectionKind.Accessor,
        Reflection_1.ReflectionKind.Method,
        Reflection_1.ReflectionKind.ObjectLiteral,
        Reflection_1.ReflectionKind.Parameter,
        Reflection_1.ReflectionKind.TypeParameter,
        Reflection_1.ReflectionKind.TypeLiteral,
        Reflection_1.ReflectionKind.CallSignature,
        Reflection_1.ReflectionKind.ConstructorSignature,
        Reflection_1.ReflectionKind.IndexSignature,
        Reflection_1.ReflectionKind.GetSignature,
        Reflection_1.ReflectionKind.SetSignature,
    ];
    GroupPlugin.SINGULARS = (function () {
        var singulars = {};
        singulars[Reflection_1.ReflectionKind.Enum] = 'Enumeration';
        singulars[Reflection_1.ReflectionKind.EnumMember] = 'Enumeration member';
        return singulars;
    })();
    GroupPlugin.PLURALS = (function () {
        var plurals = {};
        plurals[Reflection_1.ReflectionKind.Class] = 'Classes';
        plurals[Reflection_1.ReflectionKind.Property] = 'Properties';
        plurals[Reflection_1.ReflectionKind.Enum] = 'Enumerations';
        plurals[Reflection_1.ReflectionKind.EnumMember] = 'Enumeration members';
        plurals[Reflection_1.ReflectionKind.TypeAlias] = 'Type aliases';
        return plurals;
    })();
    return GroupPlugin;
})(ConverterPlugin_1.ConverterPlugin);
exports.GroupPlugin = GroupPlugin;
Converter_1.Converter.registerPlugin('group', GroupPlugin);
