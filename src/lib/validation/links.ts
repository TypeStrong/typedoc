import { i18n, type Logger } from "#utils";
import {
    type Comment,
    type CommentDisplayPart,
    type InlineTagDisplayPart,
    type ProjectReflection,
    type Reflection,
    ReflectionKind,
    ReflectionSymbolId,
} from "../models/index.js";

const linkTags = ["@link", "@linkcode", "@linkplain"];

function getBrokenPartLinks(parts: readonly CommentDisplayPart[]) {
    const links: InlineTagDisplayPart[] = [];

    for (const part of parts) {
        if (
            part.kind === "inline-tag" &&
            linkTags.includes(part.tag) &&
            (!part.target || part.target instanceof ReflectionSymbolId)
        ) {
            links.push(part);
        }
    }

    return links;
}

function getBrokenLinks(comment: Comment | undefined) {
    if (!comment) return [];

    const links = [...getBrokenPartLinks(comment.summary)];
    for (const tag of comment.blockTags) {
        links.push(...getBrokenPartLinks(tag.content));
    }

    return links;
}

export function validateLinks(
    project: ProjectReflection,
    logger: Logger,
): void {
    for (const id in project.reflections) {
        checkReflection(project.reflections[id], logger);
    }
}

function checkReflection(reflection: Reflection, logger: Logger) {
    if (reflection.isProject() || reflection.isDeclaration()) {
        for (const broken of getBrokenPartLinks(reflection.readme || [])) {
            const linkText = broken.text.trim();
            // #2360, "@" is a future reserved character in TSDoc component paths
            // If a link starts with it, and doesn't include a module source indicator "!"
            // then the user probably is trying to link to a package containing "@" with an absolute link.
            if (linkText.startsWith("@") && !linkText.includes("!")) {
                logger.validationWarning(
                    i18n.failed_to_resolve_link_to_0_in_readme_for_1_may_have_meant_2(
                        linkText,
                        reflection.getFriendlyFullName(),
                        linkText.replace(/[.#~]/, "!"),
                    ),
                );
            } else {
                logger.validationWarning(
                    i18n.failed_to_resolve_link_to_0_in_readme_for_1(
                        linkText,
                        reflection.getFriendlyFullName(),
                    ),
                );
            }
        }
    }

    if (reflection.isDocument()) {
        for (const broken of getBrokenPartLinks(reflection.content)) {
            const linkText = broken.text.trim();
            if (linkText.startsWith("@") && !linkText.includes("!")) {
                logger.validationWarning(
                    i18n.failed_to_resolve_link_to_0_in_document_1_may_have_meant_2(
                        linkText,
                        reflection.getFriendlyFullName(),
                        linkText.replace(/[.#~]/, "!"),
                    ),
                );
            } else {
                logger.validationWarning(
                    i18n.failed_to_resolve_link_to_0_in_document_1(
                        linkText,
                        reflection.getFriendlyFullName(),
                    ),
                );
            }
        }
    }

    for (const broken of getBrokenLinks(reflection.comment)) {
        reportBrokenCommentLink(broken, reflection, logger);
    }

    if (
        reflection.isDeclaration() &&
        reflection.kindOf(ReflectionKind.TypeAlias) &&
        reflection.type?.type === "union" &&
        reflection.type.elementSummaries
    ) {
        for (
            const broken of reflection.type.elementSummaries.flatMap(
                getBrokenPartLinks,
            )
        ) {
            reportBrokenCommentLink(broken, reflection, logger);
        }
    }
}

function reportBrokenCommentLink(broken: InlineTagDisplayPart, reflection: Reflection, logger: Logger) {
    const linkText = broken.text.trim();
    if (broken.target instanceof ReflectionSymbolId) {
        logger.validationWarning(
            i18n.comment_for_0_links_to_1_not_included_in_docs_use_external_link_2(
                reflection.getFriendlyFullName(),
                linkText,
                `{ "${broken.target.packageName}": { "${broken.target.qualifiedName}": "#" }}`,
            ),
        );
    } else if (linkText.startsWith("@") && !linkText.includes("!")) {
        logger.validationWarning(
            i18n.failed_to_resolve_link_to_0_in_comment_for_1_may_have_meant_2(
                linkText,
                reflection.getFriendlyFullName(),
                linkText.replace(/[.#~]/, "!"),
            ),
        );
    } else {
        logger.validationWarning(
            i18n.failed_to_resolve_link_to_0_in_comment_for_1(
                linkText,
                reflection.getFriendlyFullName(),
            ),
        );
    }
}
