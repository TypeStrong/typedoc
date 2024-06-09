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
                            <details
                                class={classNames(
                                    { "tsd-panel-group": true, "tsd-member-group": true, "tsd-accordion": true },
                                    props instanceof DeclarationReflection ? context.getReflectionClasses(props) : "",
                                )}
                            >
                                <summary class="tsd-accordion-summary" data-key={"section-" + item.title}>
                                    <h2>
                                        {context.icons.chevronDown()} {item.title}
                                    </h2>
                                </summary>
                                <section>
                                    {item.children.map((item) => !item.hasOwnDocument && context.member(item))}
                                </section>
                            </details>
                        ),
                )}
            </>
        );
    }

    return <>{props.groups?.map((item) => !item.allChildrenHaveOwnDocument() && context.membersGroup(item))}</>;
}
