import { PageEvent } from "../../../events";
import { DeclarationReflection, ProjectReflection } from "../../../../models";
import { MinimalThemeRenderContext } from "../MinimalTheme";
import { createElement } from "../../../../utils/template";

export const indexTemplate =
    ({ partials }: MinimalThemeRenderContext) =>
    (props: PageEvent<ProjectReflection>) =>
        (
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
