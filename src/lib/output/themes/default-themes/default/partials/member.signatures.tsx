import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const memberSignatures = (props) => (
    <>
        <ul className={"tsd-signatures " + props.cssClasses}>
            {props.signatures.map((item, i) => (
                <>
                    {" "}
                    <li className="tsd-signature tsd-kind-icon">
                        <Compact>{__partials__.memberSignatureTitle(item)}</Compact>
                    </li>
                </>
            ))}
        </ul>

        <ul className="tsd-descriptions">
            {props.signatures.map((item, i) => (
                <>
                    {" "}
                    <li className="tsd-description">{__partials__.memberSignatureBody(item)}</li>
                </>
            ))}
        </ul>
    </>
);
