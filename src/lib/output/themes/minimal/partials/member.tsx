import { wbr, __partials__ } from "../../lib";
import * as React from "react";
export const member = (props) => (
    <>
        <section className={"tsd-panel tsd-member " + props.cssClasses}>
            <a name={props.anchor} className="tsd-anchor"></a>
            {!!props.name && (
                <>
                    {" "}
                    <h3>
                        {props.flags.map((item, i) => (
                            <>
                                <span className={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                            </>
                        ))}
                        {wbr(TODO)}
                    </h3>
                </>
            )}
            {!!props.signatures ? (
                <> {__partials__["memberSignatures"](props)}</>
            ) : props.hasGetterOrSetter ? (
                <>{__partials__["memberGetterSetter"](props)}</>
            ) : props.tryGetTargetReflectionDeep ? (
                <>{__partials__["memberReference"](props)}</>
            ) : (
                <> {__partials__["memberDeclaration"](props)}</>
            )}

            {!Boolean(props.isContainer) &&
                props.groups.map((item, i) => (
                    <>
                        {item.children.map((item, i) => (
                            <>{!item.hasOwnDocument && <> {__partials__.member(item)}</>}</>
                        ))}
                    </>
                ))}
        </section>

        {!!props.isContainer && (
            <>
                {" "}
                {__partials__.index(props)}
                {__partials__.members(props)}
            </>
        )}
    </>
);
