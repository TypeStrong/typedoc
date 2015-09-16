import * as ts from "typescript";

import {Comment, CommentTag} from "../../models/comments/index";
import {IntrinsicType} from "../../models/types/index";
import {Reflection, ReflectionFlag, ReflectionKind, TraverseProperty,
    TypeParameterReflection, DeclarationReflection, ProjectReflection,
    SignatureReflection, ParameterReflection} from "../../models/reflections/index";
import {Component, ConverterComponent} from "../components";
import {parseComment, getRawComment} from "../factories/comment";
import {Converter} from "../converter";
import {Context} from "../context";


/**
 * Structure used by [[ContainerCommentHandler]] to store discovered module comments.
 */
interface IModuleComment
{
    /**
     * The module reflection this comment is targeting.
     */
    reflection:Reflection;

    /**
     * The full text of the best matched comment.
     */
    fullText:string;

    /**
     * Has the full text been marked as being preferred?
     */
    isPreferred:boolean;
}


/**
 * A handler that parses javadoc comments and attaches [[Models.Comment]] instances to
 * the generated reflections.
 */
@Component({name:'comment'})
export class CommentPlugin extends ConverterComponent
{
    /**
     * List of discovered module comments.
     */
    private comments:{[id:number]:IModuleComment};

    /**
     * List of hidden reflections.
     */
    private hidden:Reflection[];


    /**
     * Create a new CommentPlugin instance.
     */
    initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_BEGIN]:                   this.onBegin,
            [Converter.EVENT_CREATE_DECLARATION]:      this.onDeclaration,
            [Converter.EVENT_CREATE_SIGNATURE]:        this.onDeclaration,
            [Converter.EVENT_CREATE_TYPE_PARAMETER]:   this.onCreateTypeParameter,
            [Converter.EVENT_FUNCTION_IMPLEMENTATION]: this.onFunctionImplementation,
            [Converter.EVENT_RESOLVE_BEGIN]:           this.onBeginResolve,
            [Converter.EVENT_RESOLVE]:                 this.onResolve
        });
    }


    private storeModuleComment(comment:string, reflection:Reflection) {
        var isPreferred = (comment.toLowerCase().indexOf('@preferred') != -1);

        if (this.comments[reflection.id]) {
            var info = this.comments[reflection.id];
            if (!isPreferred && (info.isPreferred || info.fullText.length > comment.length)) {
                return;
            }

            info.fullText    = comment;
            info.isPreferred = isPreferred;
        } else {
            this.comments[reflection.id] = {
                reflection:  reflection,
                fullText:    comment,
                isPreferred: isPreferred
            };
        }
    }


    /**
     * Apply all comment tag modifiers to the given reflection.
     *
     * @param reflection  The reflection the modifiers should be applied to.
     * @param comment  The comment that should be searched for modifiers.
     */
    private applyModifiers(reflection:Reflection, comment:Comment) {
        if (comment.hasTag('private')) {
            reflection.setFlag(ReflectionFlag.Private);
            CommentPlugin.removeTags(comment, 'private');
        }

        if (comment.hasTag('protected')) {
            reflection.setFlag(ReflectionFlag.Protected);
            CommentPlugin.removeTags(comment, 'protected');
        }

        if (comment.hasTag('public')) {
            reflection.setFlag(ReflectionFlag.Public);
            CommentPlugin.removeTags(comment, 'public');
        }

        if (comment.hasTag('event')) {
            reflection.kind = ReflectionKind.Event;
            // reflection.setFlag(ReflectionFlag.Event);
            CommentPlugin.removeTags(comment, 'event');
        }

        if (comment.hasTag('hidden')) {
            if (!this.hidden) this.hidden = [];
            this.hidden.push(reflection);
        }
    }


    /**
     * Triggered when the converter begins converting a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onBegin(context:Context) {
        this.comments = {};
    }


    /**
     * Triggered when the converter has created a type parameter reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently processed.
     * @param node  The node that is currently processed if available.
     */
    private onCreateTypeParameter(context:Context, reflection:TypeParameterReflection, node?:ts.Node) {
        var comment = reflection.parent.comment;
        if (comment) {
            var tag = comment.getTag('typeparam', reflection.name);
            if (!tag) tag = comment.getTag('param', '<' + reflection.name + '>');
            if (!tag) tag = comment.getTag('param', reflection.name);

            if (tag) {
                reflection.comment = new Comment(tag.text);
                comment.tags.splice(comment.tags.indexOf(tag), 1);
            }
        }
    }


    /**
     * Triggered when the converter has created a declaration or signature reflection.
     *
     * Invokes the comment parser.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently processed.
     * @param node  The node that is currently processed if available.
     */
    private onDeclaration(context:Context, reflection:Reflection, node?:ts.Node) {
        if (!node) return;
        var rawComment = getRawComment(node);
        if (!rawComment) return;

        if (reflection.kindOf(ReflectionKind.FunctionOrMethod) || (reflection.kindOf(ReflectionKind.Event) && reflection['signatures'])) {
            var comment = parseComment(rawComment, reflection.comment);
            this.applyModifiers(reflection, comment);
        } else if (reflection.kindOf(ReflectionKind.Module)) {
            this.storeModuleComment(rawComment, reflection);
        } else {
            var comment = parseComment(rawComment, reflection.comment);
            this.applyModifiers(reflection, comment);
            reflection.comment = comment;
        }
    }


    /**
     * Triggered when the converter has found a function implementation.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently processed.
     * @param node  The node that is currently processed if available.
     */
    private onFunctionImplementation(context:Context, reflection:Reflection, node?:ts.Node) {
        if (!node) return;

        var comment = getRawComment(node);
        if (comment) {
            reflection.comment = parseComment(comment, reflection.comment);
        }
    }


    /**
     * Triggered when the converter begins resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onBeginResolve(context:Context) {
        for (var id in this.comments) {
            if (!this.comments.hasOwnProperty(id)) continue;

            var info    = this.comments[id];
            var comment = parseComment(info.fullText);
            CommentPlugin.removeTags(comment, 'preferred');

            this.applyModifiers(info.reflection, comment);
            info.reflection.comment = comment;
        }

        if (this.hidden) {
            var project = context.project;
            this.hidden.forEach((reflection) => {
                CommentPlugin.removeReflection(project, reflection);
            });
        }
    }


    /**
     * Triggered when the converter resolves a reflection.
     *
     * Cleans up comment tags related to signatures like @param or @return
     * and moves their data to the corresponding parameter reflections.
     *
     * This hook also copies over the comment of function implementations to their
     * signatures.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently resolved.
     */
    private onResolve(context:Context, reflection:DeclarationReflection) {
        if (!(reflection instanceof DeclarationReflection)) return;

        var signatures = reflection.getAllSignatures();
        if (signatures.length) {
            var comment = reflection.comment;
            if (comment && comment.hasTag('returns')) {
                comment.returns = comment.getTag('returns').text;
                CommentPlugin.removeTags(comment, 'returns');
            }

            signatures.forEach((signature) => {
                var childComment = signature.comment;
                if (childComment && childComment.hasTag('returns')) {
                    childComment.returns = childComment.getTag('returns').text;
                    CommentPlugin.removeTags(childComment, 'returns');
                }

                if (comment) {
                    if (!childComment) {
                        childComment = signature.comment = new Comment();
                    }

                    childComment.shortText = childComment.shortText || comment.shortText;
                    childComment.text      = childComment.text      || comment.text;
                    childComment.returns   = childComment.returns   || comment.returns;
                }

                if (signature.parameters) {
                    signature.parameters.forEach((parameter) => {
                        var tag:CommentTag;
                        if (childComment)    tag = childComment.getTag('param', parameter.name);
                        if (comment && !tag) tag = comment.getTag('param', parameter.name);
                        if (tag) {
                            parameter.comment = new Comment(tag.text);
                        }
                    });
                }

                CommentPlugin.removeTags(childComment, 'param');
            });

            CommentPlugin.removeTags(comment, 'param');
        }
    }


    /**
     * Remove all tags with the given name from the given comment instance.
     *
     * @param comment  The comment that should be modified.
     * @param tagName  The name of the that that should be removed.
     */
    static removeTags(comment:Comment, tagName:string) {
        if (!comment || !comment.tags) return;

        var i = 0, c = comment.tags.length;
        while (i < c) {
            if (comment.tags[i].tagName == tagName) {
                comment.tags.splice(i, 1);
                c--;
            } else {
                i++;
            }
        }
    }


    /**
     * Remove the given reflection from the project.
     */
    static removeReflection(project:ProjectReflection, reflection:Reflection) {
        reflection.traverse((child) => CommentPlugin.removeReflection(project, child));

        var parent = <DeclarationReflection>reflection.parent;
        parent.traverse((child:Reflection, property:TraverseProperty) => {
            if (child == reflection) {
                switch (property) {
                    case TraverseProperty.Children:
                        if (parent.children) {
                            var index = parent.children.indexOf(<DeclarationReflection>reflection);
                            if (index != -1) parent.children.splice(index, 1);
                        }
                        break;
                    case TraverseProperty.GetSignature:
                        delete parent.getSignature;
                        break;
                    case TraverseProperty.IndexSignature:
                        delete parent.indexSignature;
                        break;
                    case TraverseProperty.Parameters:
                        if ((<SignatureReflection>reflection.parent).parameters) {
                            var index = (<SignatureReflection>reflection.parent).parameters.indexOf(<ParameterReflection>reflection);
                            if (index != -1) (<SignatureReflection>reflection.parent).parameters.splice(index, 1);
                        }
                        break;
                    case TraverseProperty.SetSignature:
                        delete parent.setSignature;
                        break;
                    case TraverseProperty.Signatures:
                        if (parent.signatures) {
                            var index = parent.signatures.indexOf(<SignatureReflection>reflection);
                            if (index != -1) parent.signatures.splice(index, 1);
                        }
                        break;
                    case TraverseProperty.TypeLiteral:
                        parent.type = new IntrinsicType('Object');
                        break;
                    case TraverseProperty.TypeParameter:
                        if (parent.typeParameters) {
                            var index = parent.typeParameters.indexOf(<TypeParameterReflection>reflection);
                            if (index != -1) parent.typeParameters.splice(index, 1);
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
    }
}
