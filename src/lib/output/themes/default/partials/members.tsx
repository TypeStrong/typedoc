import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { JSX } from "../../../../utils/index.js";
import { type ContainerReflection, DeclarationReflection } from "../../../../models/index.js";
import { classNames } from "../../lib.js";

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
