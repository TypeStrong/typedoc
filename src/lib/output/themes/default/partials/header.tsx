import { getDisplayName, hasTypeParameters, join, renderFlags } from "../../lib";
import { JSX } from "../../../../utils";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import type { PageEvent } from "../../../events";
import { Reflection, ReflectionKind } from "../../../../models";

export const header = (context: DefaultThemeRenderContext, props: PageEvent<Reflection>) => {
    const HeadingLevel = props.model.isProject() ? "h2" : "h1";
    return (
        <div class="tsd-page-title">
            {!!props.model.parent && <ul class="tsd-breadcrumb">{context.breadcrumb(props.model)}</ul>}
            <HeadingLevel>
                {props.model.kind !== ReflectionKind.Project && `${ReflectionKind.singularString(props.model.kind)} `}
                {getDisplayName(props.model)}
                {hasTypeParameters(props.model) && (
                    <>
                        {"<"}
                        {join(", ", props.model.typeParameters, (item) => item.name)}
                        {">"}
                    </>
                )}
                {renderFlags(props.model.flags, props.model.comment)}
            </HeadingLevel>
        </div>
    );
};
