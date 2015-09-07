var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require("typescript");
var Converter_1 = require("../Converter");
var ConverterPlugin_1 = require("../ConverterPlugin");
var ReferenceType_1 = require("../../models/types/ReferenceType");
var DecoratorPlugin = (function (_super) {
    __extends(DecoratorPlugin, _super);
    function DecoratorPlugin(converter) {
        _super.call(this, converter);
        converter.on(Converter_1.Converter.EVENT_BEGIN, this.onBegin, this);
        converter.on(Converter_1.Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
        converter.on(Converter_1.Converter.EVENT_RESOLVE, this.onBeginResolve, this);
    }
    DecoratorPlugin.prototype.extractArguments = function (args, signature) {
        var result = {};
        args.forEach(function (arg, index) {
            if (index < signature.parameters.length) {
                var parameter = signature.parameters[index];
                result[parameter.name] = ts.getTextOfNode(arg);
            }
            else {
                if (!result['...'])
                    result['...'] = [];
                result['...'].push(ts.getTextOfNode(arg));
            }
        });
        return result;
    };
    DecoratorPlugin.prototype.onBegin = function (context) {
        this.usages = {};
    };
    DecoratorPlugin.prototype.onDeclaration = function (context, reflection, node) {
        var _this = this;
        if (!node || !node.decorators)
            return;
        node.decorators.forEach(function (decorator) {
            var callExpression;
            var identifier;
            switch (decorator.expression.kind) {
                case 65:
                    identifier = decorator.expression;
                    break;
                case 158:
                    callExpression = decorator.expression;
                    identifier = callExpression.expression;
                    break;
                default:
                    return;
            }
            var info = {
                name: ts.getTextOfNode(identifier)
            };
            var type = context.checker.getTypeAtLocation(identifier);
            if (type && type.symbol) {
                var symbolID = context.getSymbolID(type.symbol);
                info.type = new ReferenceType_1.ReferenceType(info.name, symbolID);
                if (callExpression && callExpression.arguments) {
                    var signature = context.checker.getResolvedSignature(callExpression);
                    if (signature) {
                        info.arguments = _this.extractArguments(callExpression.arguments, signature);
                    }
                }
                if (!_this.usages[symbolID])
                    _this.usages[symbolID] = [];
                _this.usages[symbolID].push(new ReferenceType_1.ReferenceType(reflection.name, ReferenceType_1.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
            }
            if (!reflection.decorators)
                reflection.decorators = [];
            reflection.decorators.push(info);
        });
    };
    DecoratorPlugin.prototype.onBeginResolve = function (context) {
        for (var symbolID in this.usages) {
            if (!this.usages.hasOwnProperty(symbolID))
                continue;
            var id = context.project.symbolMapping[symbolID];
            if (!id)
                continue;
            var reflection = context.project.reflections[id];
            if (reflection) {
                reflection.decorates = this.usages[symbolID];
            }
        }
    };
    return DecoratorPlugin;
})(ConverterPlugin_1.ConverterPlugin);
exports.DecoratorPlugin = DecoratorPlugin;
Converter_1.Converter.registerPlugin('decorator', DecoratorPlugin);
