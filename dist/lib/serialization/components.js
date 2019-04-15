"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const utils_1 = require("../utils");
class SerializerComponent extends utils_1.AbstractComponent {
    get priority() {
        return this.constructor['PRIORITY'];
    }
}
SerializerComponent.PRIORITY = 0;
exports.SerializerComponent = SerializerComponent;
class ReflectionSerializerComponent extends SerializerComponent {
    constructor() {
        super(...arguments);
        this.serializeGroupSymbol = models_1.Reflection;
    }
    serializeGroup(instance) {
        return instance instanceof models_1.Reflection;
    }
}
exports.ReflectionSerializerComponent = ReflectionSerializerComponent;
class TypeSerializerComponent extends SerializerComponent {
    constructor() {
        super(...arguments);
        this.serializeGroupSymbol = models_1.Type;
    }
    serializeGroup(instance) {
        return instance instanceof models_1.Type;
    }
}
exports.TypeSerializerComponent = TypeSerializerComponent;
//# sourceMappingURL=components.js.map