import { With, Compact } from "../../lib";
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
                            <Compact>
                                <span className="tsd-signature-symbol">
                                    get
                                </span>{" "}
                                {props.name}
                                {partials["memberSignatureTitle"](
                                    props.getSignature,
                                    { hideName: true }
                                )}
                            </Compact>
                        </li>
                    )}
                    {!!props.setSignature && (
                        <li className="tsd-signature tsd-kind-icon">
                            <Compact>
                                <span className="tsd-signature-symbol">
                                    set
                                </span>{" "}
                                {props.name}
                                {partials["memberSignatureTitle"](
                                    props.setSignature,
                                    { hideName: true }
                                )}
                            </Compact>
                        </li>
                    )}
                </ul>

                <ul className="tsd-descriptions">
                    {!!props.getSignature && (
                        <>
                            {With(props.getSignature, (props) => (
                                <>
                                    <li className="tsd-description">
                                        {partials["memberSignatureBody"](props)}
                                    </li>
                                </>
                            ))}
                        </>
                    )}
                    {!!props.setSignature && (
                        <>
                            {With(props.setSignature, (props) => (
                                <>
                                    <li className="tsd-description">
                                        {partials["memberSignatureBody"](props)}
                                    </li>
                                </>
                            ))}
                        </>
                    )}
                </ul>
            </>
        );
