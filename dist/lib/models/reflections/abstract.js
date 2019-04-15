"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let REFLECTION_ID = 0;
function resetReflectionID() {
    REFLECTION_ID = 0;
}
exports.resetReflectionID = resetReflectionID;
var ReflectionKind;
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
    ReflectionKind[ReflectionKind["SomeType"] = 4391168] = "SomeType";
    ReflectionKind[ReflectionKind["SomeValue"] = 2097248] = "SomeValue";
})(ReflectionKind = exports.ReflectionKind || (exports.ReflectionKind = {}));
var ReflectionFlag;
(function (ReflectionFlag) {
    ReflectionFlag[ReflectionFlag["None"] = 0] = "None";
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
    ReflectionFlag[ReflectionFlag["Abstract"] = 2048] = "Abstract";
    ReflectionFlag[ReflectionFlag["Const"] = 4096] = "Const";
    ReflectionFlag[ReflectionFlag["Let"] = 8192] = "Let";
})(ReflectionFlag = exports.ReflectionFlag || (exports.ReflectionFlag = {}));
const relevantFlags = [
    ReflectionFlag.Private,
    ReflectionFlag.Protected,
    ReflectionFlag.Static,
    ReflectionFlag.ExportAssignment,
    ReflectionFlag.Optional,
    ReflectionFlag.DefaultValue,
    ReflectionFlag.Rest,
    ReflectionFlag.Abstract,
    ReflectionFlag.Let,
    ReflectionFlag.Const
];
class ReflectionFlags extends Array {
    constructor() {
        super(...arguments);
        this.flags = ReflectionFlag.None;
    }
    hasFlag(flag) {
        return (flag & this.flags) !== 0;
    }
    get isPrivate() {
        return this.hasFlag(ReflectionFlag.Private);
    }
    get isProtected() {
        return this.hasFlag(ReflectionFlag.Protected);
    }
    get isPublic() {
        return this.hasFlag(ReflectionFlag.Public);
    }
    get isStatic() {
        return this.hasFlag(ReflectionFlag.Static);
    }
    get isExported() {
        return this.hasFlag(ReflectionFlag.Exported);
    }
    get isExternal() {
        return this.hasFlag(ReflectionFlag.External);
    }
    get isOptional() {
        return this.hasFlag(ReflectionFlag.Optional);
    }
    get isRest() {
        return this.hasFlag(ReflectionFlag.Rest);
    }
    get hasExportAssignment() {
        return this.hasFlag(ReflectionFlag.ExportAssignment);
    }
    get isConstructorProperty() {
        return this.hasFlag(ReflectionFlag.ConstructorProperty);
    }
    get isAbstract() {
        return this.hasFlag(ReflectionFlag.Abstract);
    }
    get isConst() {
        return this.hasFlag(ReflectionFlag.Const);
    }
    get isLet() {
        return this.hasFlag(ReflectionFlag.Let);
    }
    setFlag(flag, set) {
        switch (flag) {
            case ReflectionFlag.Private:
                this.setSingleFlag(ReflectionFlag.Private, set);
                if (set) {
                    this.setFlag(ReflectionFlag.Protected, false);
                    this.setFlag(ReflectionFlag.Public, false);
                }
                break;
            case ReflectionFlag.Protected:
                this.setSingleFlag(ReflectionFlag.Protected, set);
                if (set) {
                    this.setFlag(ReflectionFlag.Private, false);
                    this.setFlag(ReflectionFlag.Public, false);
                }
                break;
            case ReflectionFlag.Public:
                this.setSingleFlag(ReflectionFlag.Public, set);
                if (set) {
                    this.setFlag(ReflectionFlag.Private, false);
                    this.setFlag(ReflectionFlag.Protected, false);
                }
                break;
            case ReflectionFlag.Const:
            case ReflectionFlag.Let:
                this.setSingleFlag(flag, set);
                this.setSingleFlag((ReflectionFlag.Let | ReflectionFlag.Const) ^ flag, !set);
            default:
                this.setSingleFlag(flag, set);
        }
    }
    setSingleFlag(flag, set) {
        const name = ReflectionFlag[flag].replace(/(.)([A-Z])/g, (m, a, b) => a + ' ' + b.toLowerCase());
        if (!set && this.hasFlag(flag)) {
            if (relevantFlags.includes(flag)) {
                this.splice(this.indexOf(name), 1);
            }
            this.flags ^= flag;
        }
        else if (set && !this.hasFlag(flag)) {
            if (relevantFlags.includes(flag)) {
                this.push(name);
            }
            this.flags |= flag;
        }
    }
}
exports.ReflectionFlags = ReflectionFlags;
var TraverseProperty;
(function (TraverseProperty) {
    TraverseProperty[TraverseProperty["Children"] = 0] = "Children";
    TraverseProperty[TraverseProperty["Parameters"] = 1] = "Parameters";
    TraverseProperty[TraverseProperty["TypeLiteral"] = 2] = "TypeLiteral";
    TraverseProperty[TraverseProperty["TypeParameter"] = 3] = "TypeParameter";
    TraverseProperty[TraverseProperty["Signatures"] = 4] = "Signatures";
    TraverseProperty[TraverseProperty["IndexSignature"] = 5] = "IndexSignature";
    TraverseProperty[TraverseProperty["GetSignature"] = 6] = "GetSignature";
    TraverseProperty[TraverseProperty["SetSignature"] = 7] = "SetSignature";
})(TraverseProperty = exports.TraverseProperty || (exports.TraverseProperty = {}));
class Reflection {
    constructor(name, kind, parent) {
        this.name = '';
        this.flags = new ReflectionFlags();
        this.id = REFLECTION_ID++;
        this.parent = parent;
        this.name = name;
        this.originalName = name;
        this.kind = kind;
    }
    kindOf(kind) {
        const kindArray = Array.isArray(kind) ? kind : [kind];
        return kindArray.some(kind => (this.kind & kind) !== 0);
    }
    getFullName(separator = '.') {
        if (this.parent && !this.parent.isProject()) {
            return this.parent.getFullName(separator) + separator + this.name;
        }
        else {
            return this.name;
        }
    }
    setFlag(flag, value = true) {
        this.flags.setFlag(flag, value);
    }
    getAlias() {
        if (!this._alias) {
            let alias = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            if (alias === '') {
                alias = 'reflection-' + this.id;
            }
            let target = this;
            while (target.parent && !target.parent.isProject() && !target.hasOwnDocument) {
                target = target.parent;
            }
            if (!target._aliases) {
                target._aliases = [];
            }
            let suffix = '', index = 0;
            while (target._aliases.includes(alias + suffix)) {
                suffix = '-' + (++index).toString();
            }
            alias += suffix;
            target._aliases.push(alias);
            this._alias = alias;
        }
        return this._alias;
    }
    hasComment() {
        return this.comment ? this.comment.hasVisibleComponent() : false;
    }
    hasGetterOrSetter() {
        return false;
    }
    getChildByName(arg) {
        const names = Array.isArray(arg) ? arg : arg.split('.');
        const name = names[0];
        let result;
        this.traverse((child) => {
            if (child.name === name) {
                if (names.length <= 1) {
                    result = child;
                }
                else if (child) {
                    result = child.getChildByName(names.slice(1));
                }
            }
        });
        return result;
    }
    isProject() {
        return false;
    }
    findReflectionByName(arg) {
        const names = Array.isArray(arg) ? arg : arg.split('.');
        const reflection = this.getChildByName(names);
        if (reflection) {
            return reflection;
        }
        else if (this.parent) {
            return this.parent.findReflectionByName(names);
        }
    }
    traverse(callback) { }
    toObject() {
        const result = {
            id: this.id,
            name: this.name,
            kind: this.kind,
            kindString: this.kindString,
            flags: {}
        };
        if (this.originalName !== this.name) {
            result.originalName = this.originalName;
        }
        if (this.comment) {
            result.comment = this.comment.toObject();
        }
        Object.getOwnPropertyNames(ReflectionFlags.prototype).forEach(name => {
            const descriptor = Object.getOwnPropertyDescriptor(ReflectionFlags.prototype, name);
            if (typeof descriptor.get === 'function' && this.flags[name] === true) {
                result.flags[name] = true;
            }
        });
        if (this.decorates) {
            result.decorates = this.decorates.map((type) => type.toObject());
        }
        if (this.decorators) {
            result.decorators = this.decorators.map((decorator) => {
                const result = { name: decorator.name };
                if (decorator.type) {
                    result.type = decorator.type.toObject();
                }
                if (decorator.arguments) {
                    result.arguments = decorator.arguments;
                }
                return result;
            });
        }
        this.traverse((child, property) => {
            if (property === TraverseProperty.TypeLiteral) {
                return;
            }
            let name = TraverseProperty[property];
            name = name.substr(0, 1).toLowerCase() + name.substr(1);
            if (!result[name]) {
                result[name] = [];
            }
            result[name].push(child.toObject());
        });
        return result;
    }
    toString() {
        return ReflectionKind[this.kind] + ' ' + this.name;
    }
    toStringHierarchy(indent = '') {
        const lines = [indent + this.toString()];
        indent += '  ';
        this.traverse((child, property) => {
            lines.push(child.toStringHierarchy(indent));
        });
        return lines.join('\n');
    }
}
exports.Reflection = Reflection;
//# sourceMappingURL=abstract.js.map