import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { JSX } from "../../../../utils/index.js";
import { type ContainerReflection } from "../../../../models/index.js";
import { getMemberSections } from "../../lib.js";

export function members(context: DefaultThemeRenderContext, props: ContainerReflection) {
    const sections = getMemberSections(props, (child) => !child.hasOwnDocument);

    return (
        <>
            {sections.map(({ title, children }) => {
                context.page.startNewSection(title);

                return (
                    <details class="tsd-panel-group tsd-member-group tsd-accordion" open>
                        <summary class="tsd-accordion-summary" data-key={"section-" + title}>
                            <h2>
                                {context.icons.chevronDown()} {title}
                            </h2>
                        </summary>
                        <section>{children.map((item) => context.member(item))}</section>
                    </details>
                );
            })}
        </>
    );
}
