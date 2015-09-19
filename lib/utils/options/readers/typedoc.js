var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Path = require("path");
var FS = require("fs");
var _ = require("lodash");
var options_1 = require("../options");
var declaration_1 = require("../declaration");
var component_1 = require("../../component");
var TypedocReader = (function (_super) {
    __extends(TypedocReader, _super);
    function TypedocReader() {
        _super.apply(this, arguments);
    }
    TypedocReader.prototype.initialize = function () {
        this.listenTo(this.owner, options_1.DiscoverEvent.DISCOVER, this.onDiscover, -100);
    };
    TypedocReader.prototype.onDiscover = function (event) {
        if (TypedocReader.OPTIONS_KEY in event.data) {
            this.load(event, event.data[TypedocReader.OPTIONS_KEY]);
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
        if (typeof data == 'function') {
            data = data(this.application);
        }
        if (!(typeof data == 'object')) {
            event.addError('The option file %s could not be read, it must either export a function or an object.', optionFile);
        }
        else {
            if (data.src) {
                if (typeof data.src == 'string') {
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
            name: TypedocReader.OPTIONS_KEY,
            help: 'Specify a js option file that should be loaded. If not specified TypeDoc will look for \'typedoc.js\' in the current directory.',
            type: declaration_1.ParameterType.String,
            hint: declaration_1.ParameterHint.File
        }), 
        __metadata('design:type', String)
    ], TypedocReader.prototype, "options");
    return TypedocReader;
})(options_1.OptionsComponent);
exports.TypedocReader = TypedocReader;
