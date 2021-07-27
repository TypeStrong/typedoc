import { With, __partials__, Compact } from "../../lib";
import * as React from "react";
import { TypeParameterContainer } from "../../../../models";

export const typeParameters = (props: TypeParameterContainer) => (
    <>
        <ul className="tsd-type-parameters">
            {props.typeParameters?.map((item) => (
                <>
                    {" "}
                    <li>
                        <h4>
                            <Compact>
                                {item.name}
                                {!!item.type && (
                                    <>
                                        <span className="tsd-signature-symbol">{": "}</span>
                                        {With(item.type, (props) => (
                                            <>{__partials__.type(props)}</>
                                        ))}
                                    </>
                                )}
                                {!!item.default && (
                                    <>
                                        {" = "}
                                        {With(item.default, (props) => (
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
