import { hasTypeParameters, join } from "../../lib";
import { JSX } from "../../../../utils";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import type { PageEvent } from "../../../events";
import type { Reflection } from "../../../../models";

export const header = (context: DefaultThemeRenderContext, props: PageEvent<Reflection>) => {
    const HeadingLevel = props.model.isProject() ? "h2" : "h1";
    return (
        <div class="tsd-page-title">
            {!!props.model.parent && <ul class="tsd-breadcrumb">{context.breadcrumb(props.model)}</ul>}
            <HeadingLevel>
                {props.model.kindString !== "Project" && `${props.model.kindString ?? ""} `}
                {props.model.name}
                {hasTypeParameters(props.model) && (
                    <>
                        {"<"}
                        {join(", ", props.model.typeParameters, (item) => item.name)}
                        {">"}
                    </>
                )}
            </HeadingLevel>
        </div>
    );
};
