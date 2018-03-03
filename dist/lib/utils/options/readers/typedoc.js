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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var FS = require("fs");
var _ = require("lodash");
var component_1 = require("../../component");
var options_1 = require("../options");
var declaration_1 = require("../declaration");
var TypedocReader = (function (_super) {
    __extends(TypedocReader, _super);
    function TypedocReader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TypedocReader_1 = TypedocReader;
    TypedocReader.prototype.initialize = function () {
        this.listenTo(this.owner, options_1.DiscoverEvent.DISCOVER, this.onDiscover, -150);
    };
    TypedocReader.prototype.onDiscover = function (event) {
        if (TypedocReader_1.OPTIONS_KEY in event.data) {
            this.load(event, Path.resolve(event.data[TypedocReader_1.OPTIONS_KEY]));
        }
        else if (this.application.isCLI) {
            var file = Path.resolve('typedoc.js');
            if (FS.existsSync(file)) {
                this.load(event, file);
            }
        }
    };
    TypedocReader.prototype.load = function (event, optionFile) {
        if (!FS.existsSync(optionFile)) {
            event.addError('The option file %s does not exist.', optionFile);
            return;
        }
        var data = require(optionFile);
        if (typeof data === 'function') {
            data = data(this.application);
        }
        if (!(typeof data === 'object')) {
            event.addError('The option file %s could not be read, it must either export a function or an object.', optionFile);
        }
        else {
            if (data.src) {
                if (typeof data.src === 'string') {
                    event.inputFiles = [data.src];
                }
                else if (_.isArray(data.src)) {
                    event.inputFiles = data.src;
                }
                else {
                    event.addError('The property \'src\' of the option file %s must be a string or an array.', optionFile);
                }
                delete data.src;
            }
            _.defaultsDeep(event.data, data);
        }
    };
    TypedocReader.OPTIONS_KEY = 'options';
    __decorate([
        component_1.Option({
            name: TypedocReader_1.OPTIONS_KEY,
            help: 'Specify a js option file that should be loaded. If not specified TypeDoc will look for \'typedoc.js\' in the current directory.',
            type: declaration_1.ParameterType.String,
            hint: declaration_1.ParameterHint.File
        })
    ], TypedocReader.prototype, "options", void 0);
    TypedocReader = TypedocReader_1 = __decorate([
        component_1.Component({ name: 'options:typedoc' })
    ], TypedocReader);
    return TypedocReader;
    var TypedocReader_1;
}(options_1.OptionsComponent));
exports.TypedocReader = TypedocReader;
//# sourceMappingURL=typedoc.js.map