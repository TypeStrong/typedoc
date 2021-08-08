import { PageEvent } from "../../../events";
import { DeclarationReflection, ProjectReflection } from "../../../../models";
import { createElement } from "../../../../utils/template";
import { DefaultThemeRenderContext } from "../../default/DefaultThemeRenderContext";

export const indexTemplate = ({ partials }: DefaultThemeRenderContext, props: PageEvent<ProjectReflection>) => (
    <>
        {partials.comment(props.model)}

        {props.model instanceof DeclarationReflection && (
            <>
                {!!props.model.typeHierarchy && (
                    <section class="tsd-hierarchy">
                        <h2>Hierarchy</h2>
                        {partials.hierarchy(props.model.typeHierarchy)}
                    </section>
                )}
                <div style={'position: "relative"'}>
                    <a name="typedoc-main-index" class="tsd-anchor"></a>
                </div>
                {partials.index(props.model)}
                {partials.members(props.model)}
            </>
        )}
    </>
);
