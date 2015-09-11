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
var index_1 = require("../../models/reflections/index");
var index_2 = require("../../models/comments/index");
var component_1 = require("../../utils/component");
var converter_1 = require("../converter");
var DeepCommentPlugin = (function (_super) {
    __extends(DeepCommentPlugin, _super);
    function DeepCommentPlugin() {
        _super.apply(this, arguments);
    }
    DeepCommentPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, converter_1.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, 512);
    };
    DeepCommentPlugin.prototype.onBeginResolve = function (context) {
        var project = context.project;
        var name;
        for (var key in project.reflections) {
            var reflection = project.reflections[key];
            if (!reflection.comment) {
                findDeepComment(reflection);
            }
        }
        function push(parent) {
            var part = parent.originalName;
            if (!part || part.substr(0, 2) == '__' || parent instanceof index_1.SignatureReflection) {
                part = '';
            }
            if (part && part != '') {
                name = (name == '' ? part : part + '.' + name);
            }
        }
        function findDeepComment(reflection) {
            name = '';
            push(reflection);
            var target = reflection.parent;
            while (target && !(target instanceof index_1.ProjectReflection)) {
                push(target);
                if (target.comment) {
                    var tag;
                    if (reflection instanceof index_1.TypeParameterReflection) {
                        tag = target.comment.getTag('typeparam', reflection.name);
                        if (!tag)
                            tag = target.comment.getTag('param', '<' + reflection.name + '>');
                    }
                    if (!tag)
                        tag = target.comment.getTag('param', name);
                    if (tag) {
                        target.comment.tags.splice(target.comment.tags.indexOf(tag), 1);
                        reflection.comment = new index_2.Comment('', tag.text);
                        break;
                    }
                }
                target = target.parent;
            }
        }
    };
    DeepCommentPlugin = __decorate([
        component_1.Component('deepComment'), 
        __metadata('design:paramtypes', [])
    ], DeepCommentPlugin);
    return DeepCommentPlugin;
})(component_1.ConverterComponent);
exports.DeepCommentPlugin = DeepCommentPlugin;
