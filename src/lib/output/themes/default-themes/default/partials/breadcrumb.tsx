import { With, relativeURL, __partials__ } from "../../lib";
import * as React from "react";
export const breadcrumb = (props) =>
    props.parent ? (
        <>
            {" "}
            {With(props.parent, (props) => (
                <>{__partials__.breadcrumb(props)}</>
            ))}
            <li>
                {props.url ? (
                    <>
                        {" "}
                        <a href={relativeURL(props.url)}>{props.name}</a>
                    </>
                ) : (
                    <>
                        {" "}
                        <span>{props.name}</span>
                    </>
                )}{" "}
            </li>
        </>
    ) : (
        !!props.url && (
            <>
                {" "}
                <li>
                    <a href={relativeURL(props.url)}>{props.name}</a>
                </li>
            </>
        )
    );
