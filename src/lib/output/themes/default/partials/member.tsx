import {
    assertIsDeclarationReflection,
    isDeclarationReflection,
    isReferenceReflection,
    wbr,
} from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { DeclarationReflection } from "../../../../models";

export const member =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: DeclarationReflection) =>
        (
            <>
                <section className={"tsd-panel tsd-member " + props.cssClasses}>
                    <a name={props.anchor} className="tsd-anchor"></a>
                    {!!props.name && (
                        <>
                            <h3>
                                {props.flags.map((item) => (
                                    <>
                                        <span
                                            className={
                                                "tsd-flag ts-flag" + item
                                            }
                                        >
                                            {item}
                                        </span>{" "}
                                    </>
                                ))}
                                {wbr(props.name)}
                            </h3>
                        </>
                    )}
                    {isDeclarationReflection(props) && props.signatures ? (
                        <> {partials["memberSignatures"](props)}</>
                    ) : isDeclarationReflection(props) &&
                      props.hasGetterOrSetter() ? (
                        <>{partials["memberGetterSetter"](props)}</>
                    ) : isReferenceReflection(props) && props.isReference ? (
                        <>{partials["memberReference"](props)}</>
                    ) : (
                        <> {partials["memberDeclaration"](props)}</>
                    )}

                    {props.groups?.map((item) => (
                        <>
                            {item.children.map((item) => (
                                <>
                                    {!item.hasOwnDocument && (
                                        <>
                                            {" "}
                                            {partials.member(
                                                assertIsDeclarationReflection(
                                                    item
                                                )
                                            )}
                                        </>
                                    )}
                                </>
                            ))}
                        </>
                    ))}
                </section>
            </>
        );
