import { classNames, getDisplayName, hasTypeParameters, join } from "../../lib.js";
import { JSX } from "../../../../utils/index.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import type { PageEvent } from "../../../events.js";
import type { Reflection } from "../../../../models/index.js";

export const header = (context: DefaultThemeRenderContext, props: PageEvent<Reflection>) => {
    const opts = context.options.getValue("headings");

    // Don't render on the index page or the class hierarchy page
    // We should probably someday render on the class hierarchy page, but currently breadcrumbs
    // are entirely dependent on the reflection hierarchy, so it doesn't make sense today.
    const renderBreadcrumbs = props.url !== "index.html" && props.url !== "hierarchy.html";

    // Titles are always rendered on DeclarationReflection pages and the modules page for the project.
    // They are also rendered on the readme + document pages if configured to do so by the user.
    let renderTitle: boolean;
    let titleKindString = "";
    if (props.model.isProject()) {
        if (props.url === "index.html" && props.model.readme?.length) {
            renderTitle = opts.readme;
        } else {
            renderTitle = true;
        }
    } else if (props.model.isDocument()) {
        renderTitle = opts.document;
    } else {
        renderTitle = true;
        titleKindString = context.internationalization.kindSingularString(props.model.kind) + " ";
    }

    return (
        <div class="tsd-page-title">
            {renderBreadcrumbs && <ul class="tsd-breadcrumb">{context.breadcrumb(props.model)}</ul>}
            {renderTitle && (
                <h1 class={classNames({ deprecated: props.model.isDeprecated() })}>
                    {titleKindString}
                    {getDisplayName(props.model)}
                    {hasTypeParameters(props.model) && (
                        <>
                            {"<"}
                            {join(", ", props.model.typeParameters, (item) => item.name)}
                            {">"}
                        </>
                    )}
                    {context.reflectionFlags(props.model)}
                </h1>
            )}
        </div>
    );
};
