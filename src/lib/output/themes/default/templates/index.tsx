import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import type { ProjectReflection } from "../../../../models";
import type { PageEvent } from "../../../events";
import { JSX, Raw } from "../../../../utils";

export const indexTemplate = ({ markdown }: DefaultThemeRenderContext, props: PageEvent<ProjectReflection>) => (
    <div class="tsd-panel tsd-typography">
        <Raw html={markdown(props.model.readme || [])} />
    </div>
);
