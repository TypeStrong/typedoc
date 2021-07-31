import { assertIsDeclarationReflection } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { ReflectionGroup } from "../../../../models";

export const membersGroup =
    ({ partials }: DefaultThemeRenderContext) =>
    (group: ReflectionGroup) =>
        group.categories ? (
            group.categories.map((item) => (
                <section className={"tsd-panel-group tsd-member-group " + group.cssClasses}>
                    <h2>
                        {!!item.title && <>{item.title} </>}
                        {group.title}
                    </h2>
                    {item.children.map(
                        (item) => !item.hasOwnDocument && <> {partials.member(assertIsDeclarationReflection(item))}</>
                    )}
                </section>
            ))
        ) : (
            <>
                <section className={"tsd-panel-group tsd-member-group " + group.cssClasses}>
                    <h2>{group.title}</h2>
                    {group.children.map(
                        (item) => !item.hasOwnDocument && <> {partials.member(assertIsDeclarationReflection(item))}</>
                    )}
                </section>
            </>
        );
