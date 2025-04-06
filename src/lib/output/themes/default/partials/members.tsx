import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { JSX } from "#utils";
import { type ContainerReflection } from "../../../../models/index.js";
import { getMemberSections, isNoneSection } from "../../lib.js";

export function members(context: DefaultThemeRenderContext, props: ContainerReflection) {
    const sections = getMemberSections(props, (child) => !context.router.hasOwnDocument(child));

    return (
        <>
            {sections.map((section) => {
                if (isNoneSection(section)) {
                    <section class="tsd-panel-group tsd-member-group">
                        {section.children.map((item) => context.member(item))}
                    </section>;
                }

                context.page.startNewSection(section.title);

                return (
                    <details class="tsd-panel-group tsd-member-group tsd-accordion" open>
                        <summary class="tsd-accordion-summary" data-key={"section-" + section.title}>
                            {context.icons.chevronDown()}
                            <h2>
                                {section.title}
                            </h2>
                        </summary>
                        <section>{section.children.map((item) => context.member(item))}</section>
                    </details>
                );
            })}
        </>
    );
}
