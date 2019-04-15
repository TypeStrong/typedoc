"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var CommentPlugin_1;
const index_1 = require("../../models/comments/index");
const index_2 = require("../../models/types/index");
const index_3 = require("../../models/reflections/index");
const components_1 = require("../components");
const comment_1 = require("../factories/comment");
const converter_1 = require("../converter");
let CommentPlugin = CommentPlugin_1 = class CommentPlugin extends components_1.ConverterComponent {
    initialize() {
        this.listenTo(this.owner, {
            [converter_1.Converter.EVENT_BEGIN]: this.onBegin,
            [converter_1.Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
            [converter_1.Converter.EVENT_CREATE_SIGNATURE]: this.onDeclaration,
            [converter_1.Converter.EVENT_CREATE_TYPE_PARAMETER]: this.onCreateTypeParameter,
            [converter_1.Converter.EVENT_FUNCTION_IMPLEMENTATION]: this.onFunctionImplementation,
            [converter_1.Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve,
            [converter_1.Converter.EVENT_RESOLVE]: this.onResolve
        });
    }
    storeModuleComment(comment, reflection) {
        const isPreferred = (comment.toLowerCase().includes('@preferred'));
        if (this.comments[reflection.id]) {
            const info = this.comments[reflection.id];
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
    }
    applyModifiers(reflection, comment) {
        if (comment.hasTag('private')) {
            reflection.setFlag(index_3.ReflectionFlag.Private);
            CommentPlugin_1.removeTags(comment, 'private');
        }
        if (comment.hasTag('protected')) {
            reflection.setFlag(index_3.ReflectionFlag.Protected);
            CommentPlugin_1.removeTags(comment, 'protected');
        }
        if (comment.hasTag('public')) {
            reflection.setFlag(index_3.ReflectionFlag.Public);
            CommentPlugin_1.removeTags(comment, 'public');
        }
        if (comment.hasTag('event')) {
            reflection.kind = index_3.ReflectionKind.Event;
            CommentPlugin_1.removeTags(comment, 'event');
        }
        if (comment.hasTag('hidden') || comment.hasTag('ignore')) {
            if (!this.hidden) {
                this.hidden = [];
            }
            this.hidden.push(reflection);
        }
    }
    onBegin(context) {
        this.hidden = undefined;
        this.comments = {};
    }
    onCreateTypeParameter(context, reflection, node) {
        const comment = reflection.parent && reflection.parent.comment;
        if (comment) {
            let tag = comment.getTag('typeparam', reflection.name);
            if (!tag) {
                tag = comment.getTag('param', `<${reflection.name}>`);
            }
            if (!tag) {
                tag = comment.getTag('param', reflection.name);
            }
            if (tag) {
                reflection.comment = new index_1.Comment(tag.text);
                comment.tags.splice(comment.tags.indexOf(tag), 1);
            }
        }
    }
    onDeclaration(context, reflection, node) {
        if (!node) {
            return;
        }
        const rawComment = comment_1.getRawComment(node);
        if (!rawComment) {
            return;
        }
        if (reflection.kindOf(index_3.ReflectionKind.FunctionOrMethod) || (reflection.kindOf(index_3.ReflectionKind.Event) && reflection['signatures'])) {
            const comment = comment_1.parseComment(rawComment, reflection.comment);
            this.applyModifiers(reflection, comment);
        }
        else if (reflection.kindOf(index_3.ReflectionKind.Module)) {
            this.storeModuleComment(rawComment, reflection);
        }
        else {
            const comment = comment_1.parseComment(rawComment, reflection.comment);
            this.applyModifiers(reflection, comment);
            reflection.comment = comment;
        }
    }
    onFunctionImplementation(context, reflection, node) {
        if (!node) {
            return;
        }
        const comment = comment_1.getRawComment(node);
        if (comment) {
            reflection.comment = comment_1.parseComment(comment, reflection.comment);
        }
    }
    onBeginResolve(context) {
        for (let id in this.comments) {
            if (!this.comments.hasOwnProperty(id)) {
                continue;
            }
            const info = this.comments[id];
            const comment = comment_1.parseComment(info.fullText);
            CommentPlugin_1.removeTags(comment, 'preferred');
            this.applyModifiers(info.reflection, comment);
            info.reflection.comment = comment;
        }
        if (this.hidden) {
            const project = context.project;
            CommentPlugin_1.removeReflections(project, this.hidden);
        }
    }
    onResolve(context, reflection) {
        if (!(reflection instanceof index_3.DeclarationReflection)) {
            return;
        }
        const signatures = reflection.getAllSignatures();
        if (signatures.length) {
            const comment = reflection.comment;
            if (comment && comment.hasTag('returns')) {
                comment.returns = comment.getTag('returns').text;
                CommentPlugin_1.removeTags(comment, 'returns');
            }
            signatures.forEach((signature) => {
                let childComment = signature.comment;
                if (childComment && childComment.hasTag('returns')) {
                    childComment.returns = childComment.getTag('returns').text;
                    CommentPlugin_1.removeTags(childComment, 'returns');
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
                    signature.parameters.forEach((parameter) => {
                        let tag;
                        if (childComment) {
                            tag = childComment.getTag('param', parameter.name);
                        }
                        if (comment && !tag) {
                            tag = comment.getTag('param', parameter.name);
                        }
                        if (tag) {
                            parameter.comment = new index_1.Comment(tag.text);
                        }
                    });
                }
                CommentPlugin_1.removeTags(childComment, 'param');
            });
            CommentPlugin_1.removeTags(comment, 'param');
        }
    }
    static removeTags(comment, tagName) {
        if (!comment || !comment.tags) {
            return;
        }
        let i = 0, c = comment.tags.length;
        while (i < c) {
            if (comment.tags[i].tagName === tagName) {
                comment.tags.splice(i, 1);
                c--;
            }
            else {
                i++;
            }
        }
    }
    static removeReflections(project, reflections) {
        const deletedIds = [];
        reflections.forEach((reflection) => {
            CommentPlugin_1.removeReflection(project, reflection, deletedIds);
        });
        for (let key in project.symbolMapping) {
            if (project.symbolMapping.hasOwnProperty(key) && deletedIds.includes(project.symbolMapping[key])) {
                delete project.symbolMapping[key];
            }
        }
    }
    static removeReflection(project, reflection, deletedIds) {
        reflection.traverse((child) => CommentPlugin_1.removeReflection(project, child, deletedIds));
        const parent = reflection.parent;
        parent.traverse((child, property) => {
            if (child === reflection) {
                switch (property) {
                    case index_3.TraverseProperty.Children:
                        if (parent.children) {
                            const index = parent.children.indexOf(reflection);
                            if (index !== -1) {
                                parent.children.splice(index, 1);
                            }
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
                            const index = reflection.parent.parameters.indexOf(reflection);
                            if (index !== -1) {
                                reflection.parent.parameters.splice(index, 1);
                            }
                        }
                        break;
                    case index_3.TraverseProperty.SetSignature:
                        delete parent.setSignature;
                        break;
                    case index_3.TraverseProperty.Signatures:
                        if (parent.signatures) {
                            const index = parent.signatures.indexOf(reflection);
                            if (index !== -1) {
                                parent.signatures.splice(index, 1);
                            }
                        }
                        break;
                    case index_3.TraverseProperty.TypeLiteral:
                        parent.type = new index_2.IntrinsicType('Object');
                        break;
                    case index_3.TraverseProperty.TypeParameter:
                        if (parent.typeParameters) {
                            const index = parent.typeParameters.indexOf(reflection);
                            if (index !== -1) {
                                parent.typeParameters.splice(index, 1);
                            }
                        }
                        break;
                }
            }
        });
        let id = reflection.id;
        delete project.reflections[id];
        if (deletedIds) {
            deletedIds.push(id);
        }
        else {
            for (let key in project.symbolMapping) {
                if (project.symbolMapping.hasOwnProperty(key) && project.symbolMapping[key] === id) {
                    delete project.symbolMapping[key];
                }
            }
        }
    }
};
CommentPlugin = CommentPlugin_1 = __decorate([
    components_1.Component({ name: 'comment' })
], CommentPlugin);
exports.CommentPlugin = CommentPlugin;
//# sourceMappingURL=CommentPlugin.js.map