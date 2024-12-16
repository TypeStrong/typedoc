import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import type { ProjectReflection } from "../../../../models/index.js";
import type { PageEvent } from "../../../events.js";
import { JSX } from "#utils";

export const indexTemplate = ({ markdown }: DefaultThemeRenderContext, props: PageEvent<ProjectReflection>) => (
    <div class="tsd-panel tsd-typography">
        <JSX.Raw html={markdown(props.model.readme || [])} />
    </div>
);
