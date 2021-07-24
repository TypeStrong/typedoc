import { __partials__, classNames } from "../../lib";
import * as React from "react";
import { PageEvent } from "../../../../events";
export const footer = (props: PageEvent) => (
    <>
        <footer className={classNames({'with-border-bottom': !props.settings.hideGenerator})}>
            <div className="container">
                <h2>Legend</h2>
                <div className="tsd-legend-group">
                    {props.legend?.map((item) => (
                        <>
                            {" "}
                            <ul className="tsd-legend">
                                {item.props.map((item) => (
                                    <>
                                        {" "}
                                        <li className={classNames({}) /* TODO generate the list of classnames from this: "<Compact>#each classes . /each</Compact>" */}>
                                            <span className="tsd-kind-icon">{item.name}</span>
                                        </li>
                                    </>
                                ))}{" "}
                            </ul>
                        </>
                    ))}{" "}
                </div>
            </div>
        </footer>

        {!props.settings.hideGenerator && (
            <>
                {" "}
                <div className="container tsd-generator">
                    <p>
                        Generated using{" "}
                        <a href="https://typedoc.org/" target="_blank">
                            TypeDoc
                        </a>
                    </p>
                </div>
            </>
        )}
    </>
);
