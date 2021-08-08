import { assertIsDeclarationReflection } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { ContainerReflection } from "../../../../models";

export function members({ partials }: DefaultThemeRenderContext, props: ContainerReflection) {
    if (props.categories && props.categories.length) {
        return (
            <>
                {props.categories.map(
                    (item) =>
                        !item.allChildrenHaveOwnDocument() && (
                            <section class={"tsd-panel-group tsd-member-group " + props.cssClasses}>
                                <h2>{item.title}</h2>
                                {item.children.map(
                                    (item) =>
                                        !item.hasOwnDocument && partials.member(assertIsDeclarationReflection(item))
                                )}
                            </section>
                        )
                )}
            </>
        );
    }

    return <>{props.groups?.map((item) => !item.allChildrenHaveOwnDocument() && partials.membersGroup(item))}</>;
}
