import { __partials__ } from "../../lib";
import * as React from "react";
import { DeclarationReflection, SignatureReflection } from "../../../../models";
// TODO is this arg type correct?
export const memberSources = (props: SignatureReflection | DeclarationReflection) => (
    <>
        <aside className="tsd-sources">
            {!!props.implementationOf && (
                <>
                    {" "}
                    <p>
                        Implementation of{" "}
                        {__partials__.typeAndParent(props.implementationOf)}
                    </p>
                </>
            )}
            {!!props.inheritedFrom && (
                <>
                    {" "}
                    <p>
                        Inherited from{" "}
                        {__partials__.typeAndParent(props.inheritedFrom)}
                    </p>
                </>
            )}
            {!!props.overwrites && (
                <>
                    {" "}
                    <p>
                        Overrides{" "}
                        {__partials__.typeAndParent(props.overwrites)}
                    </p>
                </>
            )}
            {!!props.sources && (
                <>
                    {" "}
                    <ul>
                        {props.sources.map((item) => (
                            <>
                                {item.url ? (
                                    <>
                                        {" "}
                                        <li>
                                            Defined in{" "}
                                            <a href={item.url}>
                                                {item.fileName}:{item.line}
                                            </a>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        {" "}
                                        <li>
                                            Defined in {item.fileName}:{item.line}
                                        </li>
                                    </>
                                )}
                            </>
                        ))}{" "}
                    </ul>
                </>
            )}
        </aside>
    </>
);
