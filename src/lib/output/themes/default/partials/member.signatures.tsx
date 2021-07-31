import { Compact } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { DeclarationReflection } from "../../../../models";
export const memberSignatures =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: DeclarationReflection) =>
        (
            <>
                <ul className={"tsd-signatures " + props.cssClasses}>
                    {props.signatures?.map((item) => (
                        <>
                            <li className="tsd-signature tsd-kind-icon">
                                <Compact>{partials.memberSignatureTitle(item)}</Compact>
                            </li>
                        </>
                    ))}
                </ul>

                <ul className="tsd-descriptions">
                    {props.signatures?.map((item) => (
                        <>
                            <li className="tsd-description">{partials.memberSignatureBody(item)}</li>
                        </>
                    ))}
                </ul>
            </>
        );
