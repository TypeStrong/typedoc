import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { DeclarationReflection } from "../../../../models";
export const memberGetterSetter =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: DeclarationReflection) =>
        (
            <>
                <ul className={"tsd-signatures " + props.cssClasses}>
                    {!!props.getSignature && (
                        <li className="tsd-signature tsd-kind-icon">
                            <span className="tsd-signature-symbol">get</span> {props.name}
                            {partials.memberSignatureTitle(props.getSignature, { hideName: true })}
                        </li>
                    )}
                    {!!props.setSignature && (
                        <li className="tsd-signature tsd-kind-icon">
                            <span className="tsd-signature-symbol">set</span> {props.name}
                            {partials.memberSignatureTitle(props.setSignature, { hideName: true })}
                        </li>
                    )}
                </ul>

                <ul className="tsd-descriptions">
                    {!!props.getSignature && (
                        <li className="tsd-description">{partials.memberSignatureBody(props.getSignature)}</li>
                    )}
                    {!!props.setSignature && (
                        <li className="tsd-description">{partials.memberSignatureBody(props.setSignature)}</li>
                    )}
                </ul>
            </>
        );
