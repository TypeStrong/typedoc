import {
    type DeclarationReflection,
    type DocumentReflection,
    type ProjectReflection,
    ReferenceReflection,
    type Reflection,
    ReflectionKind,
} from "../../../../models/index.js";
import { JSX } from "#utils";
import { classNames, getDisplayName, getMemberSections, getUniquePath, join } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { anchorIcon } from "./anchor-icon.js";

export function moduleReflection(context: DefaultThemeRenderContext, mod: DeclarationReflection | ProjectReflection) {
    const sections = getMemberSections(mod);

    return (
        <>
            {mod.hasComment() && (
                <section class="tsd-panel tsd-comment">
                    {context.commentSummary(mod)}
                    {context.commentTags(mod)}
                </section>
            )}

            {mod.isDeclaration() && mod.kind === ReflectionKind.Module && mod.readme?.length && (
                <section class="tsd-panel tsd-typography">
                    <JSX.Raw html={context.markdown(mod.readme)} />
                </section>
            )}

            {sections.map(({ title, children, description }) => {
                context.page.startNewSection(title);

                return (
                    <details class="tsd-panel-group tsd-member-group tsd-accordion" open>
                        <summary class="tsd-accordion-summary" data-key={"section-" + title}>
                            <h2>
                                {context.icons.chevronDown()} {title}
                            </h2>
                        </summary>
                        {description && (
                            <div class="tsd-comment tsd-typography">
                                <JSX.Raw html={context.markdown(description)} />
                            </div>
                        )}
                        <dl class="tsd-member-summaries">
                            {children.map((item) => context.moduleMemberSummary(item))}
                        </dl>
                    </details>
                );
            })}
        </>
    );
}

export function moduleMemberSummary(
    context: DefaultThemeRenderContext,
    member: DeclarationReflection | DocumentReflection,
) {
    const id = context.slugger.slug(member.name);
    context.page.pageHeadings.push({
        link: `#${id}`,
        text: getDisplayName(member),
        kind: member instanceof ReferenceReflection ? member.getTargetReflectionDeep().kind : member.kind,
        classes: context.getReflectionClasses(member),
    });

    let name: JSX.Element;
    if (member instanceof ReferenceReflection) {
        const target = member.getTargetReflectionDeep();

        name = (
            <span class="tsd-member-summary-name">
                {context.reflectionIcon(target)}
                <span class={classNames({ deprecated: member.isDeprecated() })}>{member.name}</span>
                <span>&nbsp;{"\u2192"}&nbsp;</span>
                {uniqueName(context, target)}
                {anchorIcon(context, id)}
            </span>
        );
    } else {
        name = (
            <span class="tsd-member-summary-name">
                {context.reflectionIcon(member)}
                <a class={classNames({ deprecated: member.isDeprecated() })} href={context.urlTo(member)}>
                    {member.name}
                </a>
                {anchorIcon(context, id)}
            </span>
        );
    }

    return (
        <>
            <dt class={classNames({ "tsd-member-summary": true }, context.getReflectionClasses(member))} id={id}>
                {name}
            </dt>
            <dd class={classNames({ "tsd-member-summary": true }, context.getReflectionClasses(member))}>
                {context.commentShortSummary(member)}
            </dd>
        </>
    );
}

// Note: This version of uniqueName does NOT include colors... they looked weird to me
// when looking at a module page.
function uniqueName(context: DefaultThemeRenderContext, reflection: Reflection) {
    const name = join(
        ".",
        getUniquePath(reflection),
        (item) => (
            <a href={context.urlTo(item)} class={classNames({ deprecated: item.isDeprecated() })}>
                {item.name}
            </a>
        ),
    );

    return <>{name}</>;
}
