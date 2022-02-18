import type { Reflection } from "../../models/reflections/abstract";
import { Component, ConverterComponent } from "../components";
import type { Context } from "../../converter";
import { ConverterEvents } from "../converter-events";
import type { CommentDisplayPart } from "../../models";

const urlPrefix = /^(http|ftp)s?:\/\//;
const brackets = /\[\[([^\]]+)\]\]/g;
/**
 * A plugin that resolves `{@link Foo}` tags.
 */
@Component({ name: "link-resolver" })
export class LinkResolverPlugin extends ConverterComponent {
    /**
     * Create a new LinkResolverPlugin instance.
     */
    override initialize() {
        super.initialize();
        this.owner.on(ConverterEvents.RESOLVE_END, this.onResolve, this, -300);
    }

    /**
     * Find all old style double bracket references to symbols within the given text and transform them into a link.
     *
     * @param text  The text that should be parsed.
     * @returns The text with symbol references replaced by links.
     */
    private replaceBrackets(
        reflection: Reflection,
        text: string
    ): CommentDisplayPart[] {
        const parts: CommentDisplayPart[] = [];

        let begin = 0;
        brackets.lastIndex = 0;
        for (const match of text.matchAll(brackets)) {
            if (begin != match.index) {
                parts.push({
                    kind: "text",
                    text: text.substring(begin, match.index),
                });
            }
            begin = match.index! + match[0].length;
            const content = match[1];

            const { target, caption } =
                LinkResolverPlugin.splitLinkText(content);

            if (!urlPrefix.test(target)) {
                const targetRefl = reflection.findReflectionByName(target);
                if (targetRefl) {
                    parts.push({
                        kind: "inline-tag",
                        tag: "@link",
                        text: caption,
                        target: targetRefl,
                    });
                } else {
                    this.application.logger.warn(
                        "Failed to find target: " + content
                    );
                    parts.push({
                        kind: "inline-tag",
                        tag: "@link",
                        text: content,
                    });
                }
            } else {
                parts.push({
                    kind: "inline-tag",
                    tag: "@link",
                    text: caption,
                    target,
                });
            }
        }
        parts.push({
            kind: "text",
            text: text.substring(begin),
        });

        return parts;
    }

    onResolve(context: Context) {
        for (const reflection of Object.values(context.project.reflections)) {
            this.processReflection(reflection);
        }
    }

    processReflection(reflection: Reflection) {
        const comment = reflection.comment;
        if (!comment) return;

        let warned = false;
        const warn = () => {
            if (!warned) {
                warned = true;
                this.application.logger.warn(
                    `${reflection.getFullName()}: Comment [[target]] style links are deprecated and will be removed in 0.24`
                );
            }
        };

        comment.summary = this.processParts(reflection, comment.summary, warn);
        for (const tag of comment.blockTags) {
            tag.content = this.processParts(reflection, tag.content, warn);
        }
    }

    private processParts(
        reflection: Reflection,
        parts: CommentDisplayPart[],
        warn: () => void
    ): CommentDisplayPart[] {
        return parts.flatMap((part) =>
            this.processPart(reflection, part, warn)
        );
    }

    private processPart(
        reflection: Reflection,
        part: CommentDisplayPart,
        warn: () => void
    ): CommentDisplayPart | CommentDisplayPart[] {
        if (part.kind === "text" && brackets.test(part.text)) {
            warn();
            return this.replaceBrackets(reflection, part.text);
        }

        if (part.kind === "inline-tag") {
            if (
                part.tag === "@link" ||
                part.tag === "@linkcode" ||
                part.tag === "@linkplain"
            ) {
                const { caption, target } = LinkResolverPlugin.splitLinkText(
                    part.text
                );

                if (urlPrefix.test(target)) {
                    part.text = caption;
                    part.target = target;
                } else {
                    const targetRefl = reflection.findReflectionByName(target);
                    if (targetRefl) {
                        part.text = caption;
                        part.target = targetRefl;
                    } else {
                        this.application.logger.warn(
                            `Failed resolution for ${target} in ${reflection.getFullName()}`
                        );
                    }
                }
            }
        }

        return part;
    }

    /**
     * Split the given link into text and target at first pipe or space.
     *
     * @param text  The source string that should be checked for a split character.
     * @returns An object containing the link text and target.
     */
    static splitLinkText(text: string): { caption: string; target: string } {
        let splitIndex = text.indexOf("|");
        if (splitIndex === -1) {
            splitIndex = text.search(/\s/);
        }

        if (splitIndex !== -1) {
            return {
                caption: text
                    .substring(splitIndex + 1)
                    .replace(/\n+/, " ")
                    .trim(),
                target: text.substring(0, splitIndex).trim(),
            };
        } else {
            return {
                caption: text,
                target: text,
            };
        }
    }
}
