import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { JSX } from "#utils";
import { type ContainerReflection } from "../../../../models/index.js";
import { getMemberSections } from "../../lib.js";

export function members(context: DefaultThemeRenderContext, props: ContainerReflection) {
    const sections = getMemberSections(props, (child) => !context.router.hasOwnDocument(child));

    return (
        <>
            {sections.map(({ title, children }) => {
                context.page.startNewSection(title);

                return (
                    <details class="tsd-panel-group tsd-member-group tsd-accordion" open>
                        <summary class="tsd-accordion-summary" data-key={"section-" + title}>
                            {context.icons.chevronDown()}
                            <h2>
                                {title}
                            </h2>
                        </summary>
                        <section>{children.map((item) => context.member(item))}</section>
                    </details>
                );
            })}
        </>
    );
}
