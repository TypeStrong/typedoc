import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { ReferenceReflection } from "../../../../models";
export const memberReference =
    ({ relativeURL }: DefaultThemeRenderContext) =>
    (props: ReferenceReflection) => {
        const referenced = props.tryGetTargetReflectionDeep();

        if (!referenced) {
            return <> Re-exports {props.name}</>;
        }

        if (props.name === referenced.name) {
            return (
                <>
                    Re-exports <a href={relativeURL(referenced.url)}>{referenced.name}</a>
                </>
            );
        }

        return (
            <>
                Renames and re-exports <a href={relativeURL(referenced.url)}>{referenced.name}</a>
            </>
        );
    };
