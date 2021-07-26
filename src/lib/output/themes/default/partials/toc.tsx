import { classNames, relativeURL, wbr, __partials__ } from "../../lib";
import * as React from "react";
import { NavigationItem } from "../../../models/NavigationItem";

export const toc = (props: NavigationItem) => (
    <>
        <li className={classNames({current: props.isInPath}) + ' ' + props.cssClasses}>
            <a href={relativeURL(props.url)} className="tsd-kind-icon">
                {wbr(props.title)}
            </a>
            {!!props.children && (
                <>
                    {" "}
                    <ul>
                        {props.children.map((item) => (
                            <> {__partials__.toc(item)}</>
                        ))}{" "}
                    </ul>
                </>
            )}
        </li>
    </>
);
