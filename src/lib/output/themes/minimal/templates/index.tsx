import { isDeclarationReflection, With } from "../../lib";
import * as React from "react";
import { PageEvent } from "../../../events";
import { ProjectReflection } from "../../../../models";
import { MinimalThemeRenderContext } from "../MinimalTheme";
export const indexTemplate =
    ({ partials }: MinimalThemeRenderContext) =>
    (props: PageEvent<ProjectReflection>) =>
        (
            <>
                {With(props.model, (props) => (
                    <>{partials.comment(props)}</>
                ))}

                {isDeclarationReflection(props.model) && (
                    <>
                        {!!props.model.typeHierarchy && (
                            <>
                                <section className="tsd-hierarchy">
                                    <h2>Hierarchy</h2>
                                    {With(
                                        props.model.typeHierarchy,
                                        (props) => (
                                            <>{partials.hierarchy(props)}</>
                                        )
                                    )}
                                </section>
                            </>
                        )}
                        {With(props.model, (props) => (
                            <>
                                <div
                                    style={{
                                        position: "relative",
                                    }}
                                >
                                    <a
                                        {...{ name: "typedoc-main-index" }}
                                        className="tsd-anchor"
                                    ></a>
                                </div>
                                {partials.index(props)}
                                {partials.members(props)}
                            </>
                        ))}
                    </>
                )}
            </>
        );
