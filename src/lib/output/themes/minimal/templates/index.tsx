import { isDeclarationReflection } from "../../lib";
import * as React from "react";
import { PageEvent } from "../../../events";
import { ProjectReflection } from "../../../../models";
import { MinimalThemeRenderContext } from "../MinimalTheme";

export const indexTemplate =
    ({ partials }: MinimalThemeRenderContext) =>
    (props: PageEvent<ProjectReflection>) =>
        (
            <>
                {partials.comment(props.model)}

                {isDeclarationReflection(props.model) && (
                    <>
                        {!!props.model.typeHierarchy && (
                            <section className="tsd-hierarchy">
                                <h2>Hierarchy</h2>
                                {partials.hierarchy(props.model.typeHierarchy)}
                            </section>
                        )}
                        <div
                            style={{
                                position: "relative",
                            }}
                        >
                            <a name="typedoc-main-index" className="tsd-anchor"></a>
                        </div>
                        {partials.index(props.model)}
                        {partials.members(props.model)}
                    </>
                )}
            </>
        );
