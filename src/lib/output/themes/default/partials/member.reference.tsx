import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { ReferenceReflection } from "../../../../models";

export const memberReference = ({ urlTo, i18n }: DefaultThemeRenderContext, props: ReferenceReflection) => {
    const referenced = props.tryGetTargetReflectionDeep();

    if (!referenced) {
        return (
            <>
                {i18n.theme_re_exports()} {props.name}
            </>
        );
    }

    if (props.name === referenced.name) {
        return (
            <>
                {i18n.theme_re_exports()} <a href={urlTo(referenced)}>{referenced.name}</a>
            </>
        );
    }

    return (
        <>
            {i18n.theme_renames_and_re_exports()} <a href={urlTo(referenced)}>{referenced.name}</a>
        </>
    );
};
