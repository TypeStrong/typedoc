"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var index_1 = require("../../models/comments/index");
var index_2 = require("../../models/types/index");
var index_3 = require("../../models/reflections/index");
var components_1 = require("../components");
var comment_1 = require("../factories/comment");
var converter_1 = require("../converter");
var CommentPlugin = (function (_super) {
    __extends(CommentPlugin, _super);
    function CommentPlugin() {
        _super.apply(this, arguments);
    }
    CommentPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[converter_1.Converter.EVENT_BEGIN] = this.onBegin,
            _a[converter_1.Converter.EVENT_CREATE_DECLARATION] = this.onDeclaration,
            _a[converter_1.Converter.EVENT_CREATE_SIGNATURE] = this.onDeclaration,
            _a[converter_1.Converter.EVENT_CREATE_TYPE_PARAMETER] = this.onCreateTypeParameter,
            _a[converter_1.Converter.EVENT_FUNCTION_IMPLEMENTATION] = this.onFunctionImplementation,
            _a[converter_1.Converter.EVENT_RESOLVE_BEGIN] = this.onBeginResolve,
            _a[converter_1.Converter.EVENT_RESOLVE] = this.onResolve,
            _a
        ));
        var _a;
    };
    CommentPlugin.prototype.storeModuleComment = function (comment, reflection) {
        var isPreferred = (comment.toLowerCase().indexOf('@preferred') != -1);
        if (this.comments[reflection.id]) {
            var info = this.comments[reflection.id];
            if (!isPreferred && (info.isPreferred || info.fullText.length > comment.length)) {
                return;
            }
            info.fullText = comment;
            info.isPreferred = isPreferred;
        }
        else {
            this.comments[reflection.id] = {
                reflection: reflection,
                fullText: comment,
                isPreferred: isPreferred
            };
        }
    };
    CommentPlugin.prototype.applyModifiers = function (reflection, comment) {
        if (comment.hasTag('private')) {
            reflection.setFlag(index_3.ReflectionFlag.Private);
            CommentPlugin.removeTags(comment, 'private');
        }
        if (comment.hasTag('protected')) {
            reflection.setFlag(index_3.ReflectionFlag.Protected);
            CommentPlugin.removeTags(comment, 'protected');
        }
        if (comment.hasTag('public')) {
            reflection.setFlag(index_3.ReflectionFlag.Public);
            CommentPlugin.removeTags(comment, 'public');
        }
        if (comment.hasTag('event')) {
            reflection.kind = index_3.ReflectionKind.Event;
            CommentPlugin.removeTags(comment, 'event');
        }
        if (comment.hasTag('hidden')) {
            if (!this.hidden)
                this.hidden = [];
            this.hidden.push(reflection);
        }
    };
    CommentPlugin.prototype.onBegin = function (context) {
        this.comments = {};
    };
    CommentPlugin.prototype.onCreateTypeParameter = function (context, reflection, node) {
        var comment = reflection.parent.comment;
        if (comment) {
            var tag = comment.getTag('typeparam', reflection.name);
            if (!tag)
                tag = comment.getTag('param', '<' + reflection.name + '>');
            if (!tag)
                tag = comment.getTag('param', reflection.name);
            if (tag) {
                reflection.comment = new index_1.Comment(tag.text);
                comment.tags.splice(comment.tags.indexOf(tag), 1);
            }
        }
    };
    CommentPlugin.prototype.onDeclaration = function (context, reflection, node) {
        if (!node)
            return;
        var rawComment = comment_1.getRawComment(node);
        if (!rawComment)
            return;
        if (reflection.kindOf(index_3.ReflectionKind.FunctionOrMethod) || (reflection.kindOf(index_3.ReflectionKind.Event) && reflection['signatures'])) {
            var comment = comment_1.parseComment(rawComment, reflection.comment);
            this.applyModifiers(reflection, comment);
        }
        else if (reflection.kindOf(index_3.ReflectionKind.Module)) {
            this.storeModuleComment(rawComment, reflection);
        }
        else {
            var comment = comment_1.parseComment(rawComment, reflection.comment);
            this.applyModifiers(reflection, comment);
            reflection.comment = comment;
        }
    };
    CommentPlugin.prototype.onFunctionImplementation = function (context, reflection, node) {
        if (!node)
            return;
        var comment = comment_1.getRawComment(node);
        if (comment) {
            reflection.comment = comment_1.parseComment(comment, reflection.comment);
        }
    };
    CommentPlugin.prototype.onBeginResolve = function (context) {
        for (var id in this.comments) {
            if (!this.comments.hasOwnProperty(id))
                continue;
            var info = this.comments[id];
            var comment = comment_1.parseComment(info.fullText);
            CommentPlugin.removeTags(comment, 'preferred');
            this.applyModifiers(info.reflection, comment);
            info.reflection.comment = comment;
        }
        if (this.hidden) {
            var project = context.project;
            this.hidden.forEach(function (reflection) {
                CommentPlugin.removeReflection(project, reflection);
            });
        }
    };
    CommentPlugin.prototype.onResolve = function (context, reflection) {
        if (!(reflection instanceof index_3.DeclarationReflection))
            return;
        var signatures = reflection.getAllSignatures();
        if (signatures.length) {
            var comment = reflection.comment;
            if (comment && comment.hasTag('returns')) {
                comment.returns = comment.getTag('returns').text;
                CommentPlugin.removeTags(comment, 'returns');
            }
            signatures.forEach(function (signature) {
                var childComment = signature.comment;
                if (childComment && childComment.hasTag('returns')) {
                    childComment.returns = childComment.getTag('returns').text;
                    CommentPlugin.removeTags(childComment, 'returns');
                }
                if (comment) {
                    if (!childComment) {
                        childComment = signature.comment = new index_1.Comment();
                    }
                    childComment.shortText = childComment.shortText || comment.shortText;
                    childComment.text = childComment.text || comment.text;
                    childComment.returns = childComment.returns || comment.returns;
                }
                if (signature.parameters) {
                    signature.parameters.forEach(function (parameter) {
                        var tag;
                        if (childComment)
                            tag = childComment.getTag('param', parameter.name);
                        if (comment && !tag)
                            tag = comment.getTag('param', parameter.name);
                        if (tag) {
                            parameter.comment = new index_1.Comment(tag.text);
                        }
                    });
                }
                CommentPlugin.removeTags(childComment, 'param');
            });
            CommentPlugin.removeTags(comment, 'param');
        }
    };
    CommentPlugin.removeTags = function (comment, tagName) {
        if (!comment || !comment.tags)
            return;
        var i = 0, c = comment.tags.length;
        while (i < c) {
            if (comment.tags[i].tagName == tagName) {
                comment.tags.splice(i, 1);
                c--;
            }
            else {
                i++;
            }
        }
    };
    CommentPlugin.removeReflection = function (project, reflection) {
        reflection.traverse(function (child) { return CommentPlugin.removeReflection(project, child); });
        var parent = reflection.parent;
        parent.traverse(function (child, property) {
            if (child == reflection) {
                switch (property) {
                    case index_3.TraverseProperty.Children:
                        if (parent.children) {
                            var index = parent.children.indexOf(reflection);
                            if (index != -1)
                                parent.children.splice(index, 1);
                        }
                        break;
                    case index_3.TraverseProperty.GetSignature:
                        delete parent.getSignature;
                        break;
                    case index_3.TraverseProperty.IndexSignature:
                        delete parent.indexSignature;
                        break;
                    case index_3.TraverseProperty.Parameters:
                        if (reflection.parent.parameters) {
                            var index = reflection.parent.parameters.indexOf(reflection);
                            if (index != -1)
                                reflection.parent.parameters.splice(index, 1);
                        }
                        break;
                    case index_3.TraverseProperty.SetSignature:
                        delete parent.setSignature;
                        break;
                    case index_3.TraverseProperty.Signatures:
                        if (parent.signatures) {
                            var index = parent.signatures.indexOf(reflection);
                            if (index != -1)
                                parent.signatures.splice(index, 1);
                        }
                        break;
                    case index_3.TraverseProperty.TypeLiteral:
                        parent.type = new index_2.IntrinsicType('Object');
                        break;
                    case index_3.TraverseProperty.TypeParameter:
                        if (parent.typeParameters) {
                            var index = parent.typeParameters.indexOf(reflection);
                            if (index != -1)
                                parent.typeParameters.splice(index, 1);
                        }
                        break;
                }
            }
        });
        var id = reflection.id;
        delete project.reflections[id];
        for (var key in project.symbolMapping) {
            if (project.symbolMapping.hasOwnProperty(key) && project.symbolMapping[key] == id) {
                delete project.symbolMapping[key];
            }
        }
    };
    CommentPlugin = __decorate([
        components_1.Component({ name: 'comment' })
    ], CommentPlugin);
    return CommentPlugin;
}(components_1.ConverterComponent));
exports.CommentPlugin = CommentPlugin;
//# sourceMappingURL=CommentPlugin.js.map