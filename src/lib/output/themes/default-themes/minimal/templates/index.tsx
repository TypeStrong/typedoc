import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import * as React from "react";
export const component = (props) => (
    <>
        {With(props.model, (props) => (
            <>{__partials__.comment(props)}</>
        ))}

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
        ))}
    </>
);
