"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var GroupPlugin_1;
const index_1 = require("../../models/reflections/index");
const ReflectionGroup_1 = require("../../models/ReflectionGroup");
const components_1 = require("../components");
const converter_1 = require("../converter");
let GroupPlugin = GroupPlugin_1 = class GroupPlugin extends components_1.ConverterComponent {
    initialize() {
        this.listenTo(this.owner, {
            [converter_1.Converter.EVENT_RESOLVE]: this.onResolve,
            [converter_1.Converter.EVENT_RESOLVE_END]: this.onEndResolve
        });
    }
    onResolve(context, reflection) {
        reflection.kindString = GroupPlugin_1.getKindSingular(reflection.kind);
        if (reflection instanceof index_1.ContainerReflection) {
            if (reflection.children && reflection.children.length > 0) {
                reflection.children.sort(GroupPlugin_1.sortCallback);
                reflection.groups = GroupPlugin_1.getReflectionGroups(reflection.children);
            }
        }
    }
    onEndResolve(context) {
        function walkDirectory(directory) {
            directory.groups = GroupPlugin_1.getReflectionGroups(directory.getAllReflections());
            for (let key in directory.directories) {
                if (!directory.directories.hasOwnProperty(key)) {
                    continue;
                }
                walkDirectory(directory.directories[key]);
            }
        }
        const project = context.project;
        if (project.children && project.children.length > 0) {
            project.children.sort(GroupPlugin_1.sortCallback);
            project.groups = GroupPlugin_1.getReflectionGroups(project.children);
        }
        walkDirectory(project.directory);
        project.files.forEach((file) => {
            file.groups = GroupPlugin_1.getReflectionGroups(file.reflections);
        });
    }
    static getReflectionGroups(reflections) {
        const groups = [];
        reflections.forEach((child) => {
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                if (group.kind !== child.kind) {
                    continue;
                }
                group.children.push(child);
                return;
            }
            const group = new ReflectionGroup_1.ReflectionGroup(GroupPlugin_1.getKindPlural(child.kind), child.kind);
            group.children.push(child);
            groups.push(group);
        });
        groups.forEach((group) => {
            let someExported = false, allInherited = true, allPrivate = true, allProtected = true, allExternal = true;
            group.children.forEach((child) => {
                someExported = child.flags.isExported || someExported;
                allPrivate = child.flags.isPrivate && allPrivate;
                allProtected = (child.flags.isPrivate || child.flags.isProtected) && allProtected;
                allExternal = child.flags.isExternal && allExternal;
                if (child instanceof index_1.DeclarationReflection) {
                    allInherited = !!child.inheritedFrom && allInherited;
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
    }
    static getKindString(kind) {
        let str = index_1.ReflectionKind[kind];
        str = str.replace(/(.)([A-Z])/g, (m, a, b) => a + ' ' + b.toLowerCase());
        return str;
    }
    static getKindSingular(kind) {
        if (GroupPlugin_1.SINGULARS[kind]) {
            return GroupPlugin_1.SINGULARS[kind];
        }
        else {
            return GroupPlugin_1.getKindString(kind);
        }
    }
    static getKindPlural(kind) {
        if (GroupPlugin_1.PLURALS[kind]) {
            return GroupPlugin_1.PLURALS[kind];
        }
        else {
            return this.getKindString(kind) + 's';
        }
    }
    static sortCallback(a, b) {
        const aWeight = GroupPlugin_1.WEIGHTS.indexOf(a.kind);
        const bWeight = GroupPlugin_1.WEIGHTS.indexOf(b.kind);
        if (aWeight === bWeight) {
            if (a.flags.isStatic && !b.flags.isStatic) {
                return 1;
            }
            if (!a.flags.isStatic && b.flags.isStatic) {
                return -1;
            }
            if (a.name === b.name) {
                return 0;
            }
            return a.name > b.name ? 1 : -1;
        }
        else {
            return aWeight - bWeight;
        }
    }
};
GroupPlugin.WEIGHTS = [
    index_1.ReflectionKind.Global,
    index_1.ReflectionKind.ExternalModule,
    index_1.ReflectionKind.Module,
    index_1.ReflectionKind.Enum,
    index_1.ReflectionKind.EnumMember,
    index_1.ReflectionKind.Class,
    index_1.ReflectionKind.Interface,
    index_1.ReflectionKind.TypeAlias,
    index_1.ReflectionKind.Constructor,
    index_1.ReflectionKind.Event,
    index_1.ReflectionKind.Property,
    index_1.ReflectionKind.Variable,
    index_1.ReflectionKind.Function,
    index_1.ReflectionKind.Accessor,
    index_1.ReflectionKind.Method,
    index_1.ReflectionKind.ObjectLiteral,
    index_1.ReflectionKind.Parameter,
    index_1.ReflectionKind.TypeParameter,
    index_1.ReflectionKind.TypeLiteral,
    index_1.ReflectionKind.CallSignature,
    index_1.ReflectionKind.ConstructorSignature,
    index_1.ReflectionKind.IndexSignature,
    index_1.ReflectionKind.GetSignature,
    index_1.ReflectionKind.SetSignature
];
GroupPlugin.SINGULARS = (function () {
    const singulars = {};
    singulars[index_1.ReflectionKind.Enum] = 'Enumeration';
    singulars[index_1.ReflectionKind.EnumMember] = 'Enumeration member';
    return singulars;
})();
GroupPlugin.PLURALS = (function () {
    const plurals = {};
    plurals[index_1.ReflectionKind.Class] = 'Classes';
    plurals[index_1.ReflectionKind.Property] = 'Properties';
    plurals[index_1.ReflectionKind.Enum] = 'Enumerations';
    plurals[index_1.ReflectionKind.EnumMember] = 'Enumeration members';
    plurals[index_1.ReflectionKind.TypeAlias] = 'Type aliases';
    return plurals;
})();
GroupPlugin = GroupPlugin_1 = __decorate([
    components_1.Component({ name: 'group' })
], GroupPlugin);
exports.GroupPlugin = GroupPlugin;
//# sourceMappingURL=GroupPlugin.js.map