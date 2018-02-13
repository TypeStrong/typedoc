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
Object.defineProperty(exports, "__esModule", { value: true });
var abstract_1 = require("./abstract");
var UnionType = (function (_super) {
    __extends(UnionType, _super);
    function UnionType(types) {
        var _this = _super.call(this) || this;
        _this.type = 'union';
        _this.types = types;
        return _this;
    }
    UnionType.prototype.clone = function () {
        return new UnionType(this.types);
    };
    UnionType.prototype.equals = function (type) {
        if (!(type instanceof UnionType)) {
            return false;
        }
        return abstract_1.Type.isTypeListSimiliar(type.types, this.types);
    };
    UnionType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        if (this.types && this.types.length) {
            result.types = this.types.map(function (e) { return e.toObject(); });
        }
        return result;
    };
    UnionType.prototype.toString = function () {
        var names = [];
        this.types.forEach(function (element) {
            names.push(element.toString());
        });
        return names.join(' | ');
    };
    return UnionType;
}(abstract_1.Type));
exports.UnionType = UnionType;
//# sourceMappingURL=union.js.map