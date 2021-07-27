import { assertIsDeclarationReflection, isDeclarationReflection, isReferenceReflection, wbr, __partials__ } from "../../lib";
import * as React from "react";
import { DeclarationReflection } from "../../../../models";

export const member = (props: DeclarationReflection) => (
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
            {(isDeclarationReflection(props) && props.signatures) ? (
                <> {__partials__["memberSignatures"](props)}</>
            ) : (isDeclarationReflection(props) && props.hasGetterOrSetter()) ? (
                <>{__partials__["memberGetterSetter"](props)}</>
            ) : (isReferenceReflection(props) && props.isReference) ? (
                <>{__partials__["memberReference"](props)}</>
            ) : (
                <> {__partials__["memberDeclaration"](props)}</>
            )}

            {props.groups?.map((item) => (
                <>
                    {item.children.map((item) => (
                        <>{!item.hasOwnDocument && <> {__partials__.member(assertIsDeclarationReflection(item))}</>}</>
                    ))}
                </>
            ))}
        </section>
    </>
);
