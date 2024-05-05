import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import { type ContainerReflection, DeclarationReflection } from "../../../../models";
import { classNames } from "../../lib";

export function members(context: DefaultThemeRenderContext, props: ContainerReflection) {
    if (props.categories && props.categories.length) {
        return (
            <>
                {props.categories.map(
                    (item) =>
                        !item.allChildrenHaveOwnDocument() && (
                            <section
                                class={classNames(
                                    { "tsd-panel-group": true, "tsd-member-group": true },
                                    props instanceof DeclarationReflection ? context.getReflectionClasses(props) : "",
                                )}
                            >
                                <h2>{item.title}</h2>
                                {item.children.map((item) => !item.hasOwnDocument && context.member(item))}
                            </section>
                        ),
                )}
            </>
        );
    }

    return <>{props.groups?.map((item) => !item.allChildrenHaveOwnDocument() && context.membersGroup(item))}</>;
}
