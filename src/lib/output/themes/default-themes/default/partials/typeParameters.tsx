import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const typeParameters = (props) => (
    <>
        <ul className="tsd-type-parameters">
            {props.typeParameters.map((item, i) => (
                <>
                    {" "}
                    <li>
                        <h4>
                            <Compact>
                                {item.name}
                                {!!item.type && (
                                    <>
                                        {" "}
                                        <span className="tsd-signature-symbol">: </span>
                                        {With(item, item.type, (superProps, props) => (
                                            <>{__partials__.type(props)}</>
                                        ))}
                                    </>
                                )}
                                {!!item.default && (
                                    <>
                                        {" "}
                                         =
                                        {With(item, item.default, (superProps, props) => (
                                            <>{__partials__.type(props)}</>
                                        ))}
                                    </>
                                )}{" "}
                            </Compact>
                        </h4>
                        {__partials__.comment(item)}
                    </li>
                </>
            ))}
        </ul>
    </>
);
