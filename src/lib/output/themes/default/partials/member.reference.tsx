import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { ReferenceReflection } from "../../../../models";

export const memberReference = ({ urlTo }: DefaultThemeRenderContext, props: ReferenceReflection) => {
    const referenced = props.tryGetTargetReflectionDeep();

    if (!referenced) {
        return <>Re-exports {props.name}</>;
    }

    if (props.name === referenced.name) {
        return (
            <>
                Re-exports <a href={urlTo(referenced)}>{referenced.name}</a>
            </>
        );
    }

    return (
        <>
            Renames and re-exports <a href={urlTo(referenced)}>{referenced.name}</a>
        </>
    );
};
