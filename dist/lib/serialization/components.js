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
var models_1 = require("../models");
var utils_1 = require("../utils");
var SerializerComponent = (function (_super) {
    __extends(SerializerComponent, _super);
    function SerializerComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(SerializerComponent.prototype, "priority", {
        get: function () {
            return this.constructor['PRIORITY'];
        },
        enumerable: true,
        configurable: true
    });
    SerializerComponent.PRIORITY = 0;
    return SerializerComponent;
}(utils_1.AbstractComponent));
exports.SerializerComponent = SerializerComponent;
var ReflectionSerializerComponent = (function (_super) {
    __extends(ReflectionSerializerComponent, _super);
    function ReflectionSerializerComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.serializeGroup = ReflectionSerializerComponent.serializeGroup;
        _this.serializeGroupSymbol = models_1.Reflection;
        return _this;
    }
    ReflectionSerializerComponent.serializeGroup = function (instance) {
        return instance instanceof models_1.Reflection;
    };
    return ReflectionSerializerComponent;
}(SerializerComponent));
exports.ReflectionSerializerComponent = ReflectionSerializerComponent;
var TypeSerializerComponent = (function (_super) {
    __extends(TypeSerializerComponent, _super);
    function TypeSerializerComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.serializeGroup = TypeSerializerComponent.serializeGroup;
        _this.serializeGroupSymbol = models_1.Type;
        return _this;
    }
    TypeSerializerComponent.serializeGroup = function (instance) {
        return instance instanceof models_1.Type;
    };
    return TypeSerializerComponent;
}(SerializerComponent));
exports.TypeSerializerComponent = TypeSerializerComponent;
//# sourceMappingURL=components.js.map