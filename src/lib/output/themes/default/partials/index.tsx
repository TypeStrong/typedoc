import { classNames, getMemberSections, isNoneSection, type MemberSection, renderName } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { i18n, JSX } from "#utils";
import type { ContainerReflection } from "../../../../models/index.js";

function renderSection(
    { urlTo, reflectionIcon, getReflectionClasses, markdown }: DefaultThemeRenderContext,
    item: MemberSection,
) {
    return (
        <section class="tsd-index-section">
            {!isNoneSection(item) && <h3 class="tsd-index-heading">{item.title}</h3>}
            {item.description && (
                <div class="tsd-comment tsd-typography">
                    <JSX.Raw html={markdown(item.description)} />
                </div>
            )}
            <div class="tsd-index-list">
                {item.children.map((item) => (
                    <>
                        <a
                            href={urlTo(item)}
                            class={classNames(
                                { "tsd-index-link": true, deprecated: item.isDeprecated() },
                                getReflectionClasses(item),
                            )}
                        >
                            {reflectionIcon(item)}
                            <span>{renderName(item)}</span>
                        </a>
                        {"\n"}
                    </>
                ))}
            </div>
        </section>
    );
}

export function index(context: DefaultThemeRenderContext, props: ContainerReflection) {
    const sections = getMemberSections(props);

    return (
        <>
            <section class="tsd-panel-group tsd-index-group">
                <section class="tsd-panel tsd-index-panel">
                    <details class="tsd-index-content tsd-accordion" open={true}>
                        <summary class="tsd-accordion-summary tsd-index-summary">
                            {context.icons.chevronSmall()}
                            <h5 class="tsd-index-heading uppercase">
                                {i18n.theme_index()}
                            </h5>
                        </summary>
                        <div class="tsd-accordion-details">{sections.map(s => renderSection(context, s))}</div>
                    </details>
                </section>
            </section>
        </>
    );
}
