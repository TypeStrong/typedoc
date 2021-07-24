import { __partials__, Compact } from "../../lib";
import * as React from "react";
import { DeclarationReflection } from "../../../../../models";
export const memberSignatures = (props: DeclarationReflection) => (
    <>
        <ul className={"tsd-signatures " + props.cssClasses}>
            {props.signatures?.map((item) => (
                <>
                    {" "}
                    <li className="tsd-signature tsd-kind-icon">
                        <Compact>{__partials__.memberSignatureTitle(item)}</Compact>
                    </li>
                </>
            ))}
        </ul>

        <ul className="tsd-descriptions">
            {props.signatures?.map((item) => (
                <>
                    {" "}
                    <li className="tsd-description">{__partials__.memberSignatureBody(item)}</li>
                </>
            ))}
        </ul>
    </>
);
