import {
    assertIsDeclarationReflection,
    isContainer,
    isDeclarationReflection,
    isReferenceReflection,
    wbr,
} from "../../lib";
import * as React from "react";
import { DeclarationReflection } from "../../../../models";
import { MinimalThemeRenderContext } from "../MinimalTheme";

export const member =
    ({ partials }: MinimalThemeRenderContext) =>
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
                                        <span className={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                                    </>
                                ))}
                                {wbr(props.name)}
                            </h3>
                        </>
                    )}
                    {isDeclarationReflection(props) && props.signatures ? (
                        <> {partials["memberSignatures"](props)}</>
                    ) : isDeclarationReflection(props) && props.hasGetterOrSetter() ? (
                        <>{partials["memberGetterSetter"](props)}</>
                    ) : isReferenceReflection(props) && props.isReference ? (
                        <>{partials["memberReference"](props)}</>
                    ) : (
                        <> {partials["memberDeclaration"](props)}</>
                    )}

                    {!isContainer(props) &&
                        /*TODO*/ (props as unknown as DeclarationReflection).groups?.map((item) => (
                            <>
                                {item.children.map((item) => (
                                    <>
                                        {!item.hasOwnDocument && (
                                            <> {partials.member(assertIsDeclarationReflection(item))}</>
                                        )}
                                    </>
                                ))}
                            </>
                        ))}
                </section>

                {isContainer(props) && (
                    <>
                        {partials.index(props)}
                        {partials.members(props)}
                    </>
                )}
            </>
        );
