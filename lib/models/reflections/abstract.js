"use strict";
var REFLECTION_ID = 0;
function resetReflectionID() {
    REFLECTION_ID = 0;
}
exports.resetReflectionID = resetReflectionID;
(function (ReflectionKind) {
    ReflectionKind[ReflectionKind["Global"] = 0] = "Global";
    ReflectionKind[ReflectionKind["ExternalModule"] = 1] = "ExternalModule";
    ReflectionKind[ReflectionKind["Module"] = 2] = "Module";
    ReflectionKind[ReflectionKind["Enum"] = 4] = "Enum";
    ReflectionKind[ReflectionKind["EnumMember"] = 16] = "EnumMember";
    ReflectionKind[ReflectionKind["Variable"] = 32] = "Variable";
    ReflectionKind[ReflectionKind["Function"] = 64] = "Function";
    ReflectionKind[ReflectionKind["Class"] = 128] = "Class";
    ReflectionKind[ReflectionKind["Interface"] = 256] = "Interface";
    ReflectionKind[ReflectionKind["Constructor"] = 512] = "Constructor";
    ReflectionKind[ReflectionKind["Property"] = 1024] = "Property";
    ReflectionKind[ReflectionKind["Method"] = 2048] = "Method";
    ReflectionKind[ReflectionKind["CallSignature"] = 4096] = "CallSignature";
    ReflectionKind[ReflectionKind["IndexSignature"] = 8192] = "IndexSignature";
    ReflectionKind[ReflectionKind["ConstructorSignature"] = 16384] = "ConstructorSignature";
    ReflectionKind[ReflectionKind["Parameter"] = 32768] = "Parameter";
    ReflectionKind[ReflectionKind["TypeLiteral"] = 65536] = "TypeLiteral";
    ReflectionKind[ReflectionKind["TypeParameter"] = 131072] = "TypeParameter";
    ReflectionKind[ReflectionKind["Accessor"] = 262144] = "Accessor";
    ReflectionKind[ReflectionKind["GetSignature"] = 524288] = "GetSignature";
    ReflectionKind[ReflectionKind["SetSignature"] = 1048576] = "SetSignature";
    ReflectionKind[ReflectionKind["ObjectLiteral"] = 2097152] = "ObjectLiteral";
    ReflectionKind[ReflectionKind["TypeAlias"] = 4194304] = "TypeAlias";
    ReflectionKind[ReflectionKind["Event"] = 8388608] = "Event";
    ReflectionKind[ReflectionKind["ClassOrInterface"] = 384] = "ClassOrInterface";
    ReflectionKind[ReflectionKind["VariableOrProperty"] = 1056] = "VariableOrProperty";
    ReflectionKind[ReflectionKind["FunctionOrMethod"] = 2112] = "FunctionOrMethod";
    ReflectionKind[ReflectionKind["SomeSignature"] = 1601536] = "SomeSignature";
    ReflectionKind[ReflectionKind["SomeModule"] = 3] = "SomeModule";
})(exports.ReflectionKind || (exports.ReflectionKind = {}));
var ReflectionKind = exports.ReflectionKind;
(function (ReflectionFlag) {
    ReflectionFlag[ReflectionFlag["Private"] = 1] = "Private";
    ReflectionFlag[ReflectionFlag["Protected"] = 2] = "Protected";
    ReflectionFlag[ReflectionFlag["Public"] = 4] = "Public";
    ReflectionFlag[ReflectionFlag["Static"] = 8] = "Static";
    ReflectionFlag[ReflectionFlag["Exported"] = 16] = "Exported";
    ReflectionFlag[ReflectionFlag["ExportAssignment"] = 32] = "ExportAssignment";
    ReflectionFlag[ReflectionFlag["External"] = 64] = "External";
    ReflectionFlag[ReflectionFlag["Optional"] = 128] = "Optional";
    ReflectionFlag[ReflectionFlag["DefaultValue"] = 256] = "DefaultValue";
    ReflectionFlag[ReflectionFlag["Rest"] = 512] = "Rest";
    ReflectionFlag[ReflectionFlag["ConstructorProperty"] = 1024] = "ConstructorProperty";
})(exports.ReflectionFlag || (exports.ReflectionFlag = {}));
var ReflectionFlag = exports.ReflectionFlag;
var relevantFlags = [
    ReflectionFlag.Private,
    ReflectionFlag.Protected,
    ReflectionFlag.Static,
    ReflectionFlag.ExportAssignment,
    ReflectionFlag.Optional,
    ReflectionFlag.DefaultValue,
    ReflectionFlag.Rest
];
(function (TraverseProperty) {
    TraverseProperty[TraverseProperty["Children"] = 0] = "Children";
    TraverseProperty[TraverseProperty["Parameters"] = 1] = "Parameters";
    TraverseProperty[TraverseProperty["TypeLiteral"] = 2] = "TypeLiteral";
    TraverseProperty[TraverseProperty["TypeParameter"] = 3] = "TypeParameter";
    TraverseProperty[TraverseProperty["Signatures"] = 4] = "Signatures";
    TraverseProperty[TraverseProperty["IndexSignature"] = 5] = "IndexSignature";
    TraverseProperty[TraverseProperty["GetSignature"] = 6] = "GetSignature";
    TraverseProperty[TraverseProperty["SetSignature"] = 7] = "SetSignature";
})(exports.TraverseProperty || (exports.TraverseProperty = {}));
var TraverseProperty = exports.TraverseProperty;
var Reflection = (function () {
    function Reflection(parent, name, kind) {
        this.name = '';
        this.flags = [];
        this.id = REFLECTION_ID++;
        this.parent = parent;
        this.name = name;
        this.originalName = name;
        this.kind = kind;
    }
    Reflection.prototype.kindOf = function (kind) {
        if (Array.isArray(kind)) {
            for (var i = 0, c = kind.length; i < c; i++) {
                if ((this.kind & kind[i]) !== 0) {
                    return true;
                }
            }
            return false;
        }
        else {
            return (this.kind & kind) !== 0;
        }
    };
    Reflection.prototype.getFullName = function (separator) {
        if (separator === void 0) { separator = '.'; }
        if (this.parent && !this.parent.isProject()) {
            return this.parent.getFullName(separator) + separator + this.name;
        }
        else {
            return this.name;
        }
    };
    Reflection.prototype.setFlag = function (flag, value) {
        if (value === void 0) { value = true; }
        var name, index;
        if (relevantFlags.indexOf(flag) != -1) {
            name = ReflectionFlag[flag];
            name = name.replace(/(.)([A-Z])/g, function (m, a, b) { return a + ' ' + b.toLowerCase(); });
            index = this.flags.indexOf(name);
        }
        if (value) {
            this.flags.flags |= flag;
            if (name && index == -1) {
                this.flags.push(name);
            }
        }
        else {
            this.flags.flags &= ~flag;
            if (name && index != -1) {
                this.flags.splice(index, 1);
            }
        }
        switch (flag) {
            case ReflectionFlag.Private:
                this.flags.isPrivate = value;
                if (value) {
                    this.setFlag(ReflectionFlag.Protected, false);
                    this.setFlag(ReflectionFlag.Public, false);
                }
                break;
            case ReflectionFlag.Protected:
                this.flags.isProtected = value;
                if (value) {
                    this.setFlag(ReflectionFlag.Private, false);
                    this.setFlag(ReflectionFlag.Public, false);
                }
                break;
            case ReflectionFlag.Public:
                this.flags.isPublic = value;
                if (value) {
                    this.setFlag(ReflectionFlag.Private, false);
                    this.setFlag(ReflectionFlag.Protected, false);
                }
                break;
            case ReflectionFlag.Static:
                this.flags.isStatic = value;
                break;
            case ReflectionFlag.Exported:
                this.flags.isExported = value;
                break;
            case ReflectionFlag.External:
                this.flags.isExternal = value;
                break;
            case ReflectionFlag.Optional:
                this.flags.isOptional = value;
                break;
            case ReflectionFlag.Rest:
                this.flags.isRest = value;
                break;
            case ReflectionFlag.ExportAssignment:
                this.flags.hasExportAssignment = value;
                break;
            case ReflectionFlag.ConstructorProperty:
                this.flags.isConstructorProperty = value;
                break;
        }
    };
    Reflection.prototype.getAlias = function () {
        if (!this._alias) {
            var alias = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            if (alias == '') {
                alias = 'reflection-' + this.id;
            }
            var target = this;
            while (target.parent && !target.parent.isProject() && !target.hasOwnDocument) {
                target = target.parent;
            }
            if (!target._aliases)
                target._aliases = [];
            var suffix = '', index = 0;
            while (target._aliases.indexOf(alias + suffix) != -1) {
                suffix = '-' + (++index).toString();
            }
            alias += suffix;
            target._aliases.push(alias);
            this._alias = alias;
        }
        return this._alias;
    };
    Reflection.prototype.hasComment = function () {
        return (this.comment && this.comment.hasVisibleComponent());
    };
    Reflection.prototype.hasGetterOrSetter = function () {
        return false;
    };
    Reflection.prototype.getChildByName = function (arg) {
        var names = Array.isArray(arg) ? arg : arg.split('.');
        var name = names[0];
        var result = null;
        this.traverse(function (child) {
            if (child.name == name) {
                if (names.length <= 1) {
                    result = child;
                }
                else if (child) {
                    result = child.getChildByName(names.slice(1));
                }
            }
        });
        return result;
    };
    Reflection.prototype.isProject = function () {
        return false;
    };
    Reflection.prototype.findReflectionByName = function (arg) {
        var names = Array.isArray(arg) ? arg : arg.split('.');
        var reflection = this.getChildByName(names);
        if (reflection) {
            return reflection;
        }
        else {
            return this.parent.findReflectionByName(names);
        }
    };
    Reflection.prototype.traverse = function (callback) { };
    Reflection.prototype.toObject = function () {
        var result = {
            id: this.id,
            name: this.name,
            kind: this.kind,
            kindString: this.kindString,
            flags: {}
        };
        if (this.originalName != this.name) {
            result.originalName = this.originalName;
        }
        if (this.comment) {
            result.comment = this.comment.toObject();
        }
        for (var key in this.flags) {
            if (parseInt(key) == key || key == 'flags')
                continue;
            if (this.flags[key])
                result.flags[key] = true;
        }
        if (this.decorates) {
            result.decorates = this.decorates.map(function (type) { return type.toObject(); });
        }
        if (this.decorators) {
            result.decorators = this.decorators.map(function (decorator) {
                var result = { name: decorator.name };
                if (decorator.type)
                    result.type = decorator.type.toObject();
                if (decorator.arguments)
                    result.arguments = decorator.arguments;
                return result;
            });
        }
        this.traverse(function (child, property) {
            if (property == TraverseProperty.TypeLiteral)
                return;
            var name = TraverseProperty[property];
            name = name.substr(0, 1).toLowerCase() + name.substr(1);
            if (!result[name])
                result[name] = [];
            result[name].push(child.toObject());
        });
        return result;
    };
    Reflection.prototype.toString = function () {
        return ReflectionKind[this.kind] + ' ' + this.name;
    };
    Reflection.prototype.toStringHierarchy = function (indent) {
        if (indent === void 0) { indent = ''; }
        var lines = [indent + this.toString()];
        indent += '  ';
        this.traverse(function (child, property) {
            lines.push(child.toStringHierarchy(indent));
        });
        return lines.join('\n');
    };
    return Reflection;
}());
exports.Reflection = Reflection;
//# sourceMappingURL=abstract.js.map