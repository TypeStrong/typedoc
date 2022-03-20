import { classNames, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { ContainerReflection, ReflectionCategory } from "../../../../models";
import { icons } from "./icon";

function renderCategory(
    { urlTo }: DefaultThemeRenderContext,
    item: ReflectionCategory,
    cssClasses = "",
    prependName = ""
) {
    return (
        <section class={"tsd-index-section " + cssClasses}>
            <h3 class="tsd-index-heading">{prependName ? `${prependName} - ${item.title}` : item.title}</h3>
            <div class="tsd-index-list">
                {item.children.map((item) => (
                    <a
                        href={urlTo(item)}
                        class={classNames(
                            { "tsd-index-link": true, deprecated: item.comment?.hasModifier("@deprecated") },
                            item.cssClasses
                        )}
                    >
                        {icons[item.kind]()}
                        <span>{item.name ? wbr(item.name) : <em>{wbr(item.kindString!)}</em>}</span>
                    </a>
                ))}
            </div>
        </section>
    );
}

export function index(context: DefaultThemeRenderContext, props: ContainerReflection) {
    let content: JSX.Element | JSX.Element[] = [];

    if (props.categories?.length) {
        content = props.categories.map((item) => renderCategory(context, item));
    } else if (props.groups?.length) {
        content = props.groups.flatMap((item) =>
            item.categories
                ? item.categories.map((item2) => renderCategory(context, item2, item.cssClasses, item.title))
                : renderCategory(context, item)
        );
    }
    content = <div class="tsd-accordion-details">{content}</div>;

    // Accordion is only needed if any children don't have their own document.
    if (
        [...(props.groups ?? []), ...(props.categories ?? [])].some(
            (category) => !category.allChildrenHaveOwnDocument()
        )
    ) {
        content = (
            <details class="tsd-index-content tsd-index-accordion" open={true}>
                <summary class="tsd-accordion-summary tsd-index-summary">
                    <h5 class="tsd-index-heading uppercase" role="button" aria-expanded="false" tabIndex={0}>
                        {icons.chevronSmall()} Index
                    </h5>
                </summary>
                {content}
            </details>
        );
    }
    return (
        <section class="tsd-panel-group tsd-index-group">
            <section class="tsd-panel tsd-index-panel">{content}</section>
        </section>
    );
}
