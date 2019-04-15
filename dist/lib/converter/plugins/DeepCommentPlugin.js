"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../models/reflections/index");
const index_2 = require("../../models/comments/index");
const components_1 = require("../components");
const converter_1 = require("../converter");
let DeepCommentPlugin = class DeepCommentPlugin extends components_1.ConverterComponent {
    initialize() {
        this.listenTo(this.owner, converter_1.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, 512);
    }
    onBeginResolve(context) {
        const project = context.project;
        let name;
        for (let key in project.reflections) {
            const reflection = project.reflections[key];
            if (!reflection.comment) {
                findDeepComment(reflection);
            }
        }
        function push(parent) {
            let part = parent.originalName;
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
            let target = reflection.parent;
            while (target && !(target instanceof index_1.ProjectReflection)) {
                push(target);
                if (target.comment) {
                    let tag;
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
    }
};
DeepCommentPlugin = __decorate([
    components_1.Component({ name: 'deep-comment' })
], DeepCommentPlugin);
exports.DeepCommentPlugin = DeepCommentPlugin;
//# sourceMappingURL=DeepCommentPlugin.js.map