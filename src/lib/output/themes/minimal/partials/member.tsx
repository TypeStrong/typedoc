import { wbr } from "../../lib";
import * as React from "react";
import { DeclarationReflection, ReferenceReflection } from "../../../../models";
import { MinimalThemeRenderContext } from "../MinimalTheme";

export const member =
    ({ partials }: MinimalThemeRenderContext) =>
    (props: DeclarationReflection) =>
        (
            <>
                <section className={"tsd-panel tsd-member " + props.cssClasses}>
                    <a name={props.anchor} className="tsd-anchor"></a>
                    {!!props.name && (
                        <h3>
                            {props.flags.map((item) => (
                                <>
                                    <span className={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                                </>
                            ))}
                            {wbr(props.name)}
                        </h3>
                    )}
                    {props.signatures ? (
                        <> {partials.memberSignatures(props)}</>
                    ) : props.hasGetterOrSetter() ? (
                        <>{partials.memberGetterSetter(props)}</>
                    ) : props instanceof ReferenceReflection ? (
                        <>{partials.memberReference(props)}</>
                    ) : (
                        <> {partials.memberDeclaration(props)}</>
                    )}
                </section>

                {partials.index(props)}
                {partials.members(props)}
            </>
        );
