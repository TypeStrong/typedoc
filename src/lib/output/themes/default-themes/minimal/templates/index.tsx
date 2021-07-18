import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const component = (props) => (
    <>
        {With(props, props.model, (superProps, props) => (
            <>{__partials__.comment(props)}</>
        ))}

        {!!props.model.typeHierarchy && (
            <>
                {" "}
                <section className="tsd-hierarchy">
                    <h2>Hierarchy</h2>
                    {With(props, props.model.typeHierarchy, (superProps, props) => (
                        <>{__partials__.hierarchy(props)}</>
                    ))}
                </section>
            </>
        )}
        {With(props, props.model, (superProps, props) => (
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
        ))}
    </>
);
