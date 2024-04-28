import { classNames, getDisplayName, hasTypeParameters, join } from "../../lib.js";
import { JSX } from "../../../../utils/index.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import type { PageEvent } from "../../../events.js";
import { Reflection, ReflectionKind } from "../../../../models/index.js";

export const header = (context: DefaultThemeRenderContext, props: PageEvent<Reflection>) => {
    const HeadingLevel = props.model.isProject() ? "h2" : "h1";
    return (
        <div class="tsd-page-title">
            {!!props.model.parent && <ul class="tsd-breadcrumb">{context.breadcrumb(props.model)}</ul>}
            <HeadingLevel class={classNames({ deprecated: props.model.isDeprecated() })}>
                {props.model.kind !== ReflectionKind.Project &&
                    `${context.internationalization.kindSingularString(props.model.kind)} `}
                {getDisplayName(props.model)}
                {hasTypeParameters(props.model) && (
                    <>
                        {"<"}
                        {join(", ", props.model.typeParameters, (item) => item.name)}
                        {">"}
                    </>
                )}
                {context.reflectionFlags(props.model)}
            </HeadingLevel>
        </div>
    );
};
