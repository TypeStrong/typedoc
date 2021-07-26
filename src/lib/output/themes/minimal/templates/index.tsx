import { isDeclarationReflection, With, __partials__ } from "../../lib";
import * as React from "react";
import { PageEvent } from "../../../events";
import { ProjectReflection } from "../../../../models";
export const indexTemplate = (props: PageEvent<ProjectReflection>) => (
    <>
        {With(props.model, (props) => (
            <>{__partials__.comment(props)}</>
        ))}

        {isDeclarationReflection(props.model) && <>
        {!!props.model.typeHierarchy && (
            <>
                {" "}
                <section className="tsd-hierarchy">
                    <h2>Hierarchy</h2>
                    {With(props.model.typeHierarchy, (props) => (
                        <>{__partials__.hierarchy(props)}</>
                    ))}
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
                    <a {...{ name: "typedoc-main-index" }} className="tsd-anchor"></a>
                </div>
                {__partials__.index(props)}
                {__partials__.members(props)}
            </>
        ))}</>}
    </>
);
