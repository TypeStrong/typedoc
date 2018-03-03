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
var index_1 = require("../../models/reflections/index");
var index_2 = require("../../models/comments/index");
var components_1 = require("../components");
var converter_1 = require("../converter");
var DeepCommentPlugin = (function (_super) {
    __extends(DeepCommentPlugin, _super);
    function DeepCommentPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
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
            if (!part || part.substr(0, 2) === '__' || parent instanceof index_1.SignatureReflection) {
                part = '';
            }
            if (part && part !== '') {
                name = (name === '' ? part : part + '.' + name);
            }
        }
        function findDeepComment(reflection) {
            name = '';
            push(reflection);
            var target = reflection.parent;
            while (target && !(target instanceof index_1.ProjectReflection)) {
                push(target);
                if (target.comment) {
                    var tag = void 0;
                    if (reflection instanceof index_1.TypeParameterReflection) {
                        tag = target.comment.getTag('typeparam', reflection.name);
                        if (!tag) {
                            tag = target.comment.getTag('param', '<' + reflection.name + '>');
                        }
                    }
                    if (!tag) {
                        tag = target.comment.getTag('param', name);
                    }
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
        components_1.Component({ name: 'deep-comment' })
    ], DeepCommentPlugin);
    return DeepCommentPlugin;
}(components_1.ConverterComponent));
exports.DeepCommentPlugin = DeepCommentPlugin;
//# sourceMappingURL=DeepCommentPlugin.js.map