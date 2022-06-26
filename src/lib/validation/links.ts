import type { Comment, CommentDisplayPart, ProjectReflection } from "../models";
import type { Logger } from "../utils";

const linkTags = ["@link", "@linkcode", "@linkplain"];

function getBrokenLinks(comment: Comment | undefined) {
    const links: string[] = [];

    function processPart(part: CommentDisplayPart) {
        if (
            part.kind === "inline-tag" &&
            linkTags.includes(part.tag) &&
            !part.target
        ) {
            links.push(part.text);
        }
    }

    comment?.summary.forEach(processPart);
    comment?.blockTags.forEach((tag) => tag.content.forEach(processPart));

    return links;
}

export function validateLinks(
    project: ProjectReflection,
    logger: Logger
): void {
    for (const reflection of Object.values(project.reflections)) {
        for (const broken of getBrokenLinks(reflection.comment)) {
            logger.warn(
                `Failed to resolve link to "${broken}" in comment for ${reflection.getFullName()}`
            );
        }
    }
}
