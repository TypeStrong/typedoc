import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { ProjectReflection } from "../../../../models";
import { PageEvent } from "../../../events";
import { createElement, Raw } from "../../../../utils";

export const indexTemplate =
    ({ markdown }: DefaultThemeRenderContext) =>
    (props: PageEvent<ProjectReflection>) =>
        (
            <div class="tsd-panel tsd-typography">
                <Raw html={markdown(props.model.readme)} />
            </div>
        );
