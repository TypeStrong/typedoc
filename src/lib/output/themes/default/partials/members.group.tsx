import { assertIsDeclarationReflection, __partials__ } from "../../lib";
import * as React from "react";
import { ReflectionGroup } from "../../../../models";

export const membersGroup = (props: ReflectionGroup) =>
    props.categories ? (
        props.categories.map((item) => (
            <>
                {" "}
                <section className={"tsd-panel-group tsd-member-group " + props.cssClasses}>
                    <h2>
                        {!!item.title && <>{item.title} </>}
                        {props.title}
                    </h2>
                    {item.children.map((item) => (
                        <>{!item.hasOwnDocument && <> {__partials__.member(assertIsDeclarationReflection(item))}</>}</>
                    ))}{" "}
                </section>
            </>
        ))
    ) : (
        <>
            {" "}
            <section className={"tsd-panel-group tsd-member-group " + props.cssClasses}>
                <h2>{props.title}</h2>
                {props.children.map((item) => (
                    <>{!item.hasOwnDocument && <> {__partials__.member(assertIsDeclarationReflection(item))}</>}</>
                ))}{" "}
            </section>
        </>
    );
