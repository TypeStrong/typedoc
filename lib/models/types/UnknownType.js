var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Type_1 = require("../Type");
var UnknownType = (function (_super) {
    __extends(UnknownType, _super);
    function UnknownType(name) {
        _super.call(this);
        this.name = name;
    }
    UnknownType.prototype.clone = function () {
        var clone = new UnknownType(this.name);
        clone.isArray = this.isArray;
        return clone;
    };
    UnknownType.prototype.equals = function (type) {
        return type instanceof UnknownType &&
            type.isArray == this.isArray &&
            type.name == this.name;
    };
    UnknownType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        result.type = 'unknown';
        result.name = this.name;
        return result;
    };
    UnknownType.prototype.toString = function () {
        return this.name;
    };
    return UnknownType;
})(Type_1.Type);
exports.UnknownType = UnknownType;
