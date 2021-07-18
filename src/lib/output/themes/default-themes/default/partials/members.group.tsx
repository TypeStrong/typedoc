import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const membersGroup = (props) =>
    props.categories ? (
        props.categories.map((item, i) => (
            <>
                {" "}
                <section className={"tsd-panel-group tsd-member-group " + item.cssClasses}>
                    <h2>
                        {!!item.title && <>{item.title} </>}
                        {item.superProps.title}
                    </h2>
                    {item.children.map((item, i) => (
                        <>{!item.hasOwnDocument && <> {__partials__.member(item)}</>}</>
                    ))}{" "}
                </section>
            </>
        ))
    ) : (
        <>
            {" "}
            <section className={"tsd-panel-group tsd-member-group " + props.cssClasses}>
                <h2>{props.title}</h2>
                {props.children.map((item, i) => (
                    <>{!item.hasOwnDocument && <> {__partials__.member(item)}</>}</>
                ))}{" "}
            </section>
        </>
    );
