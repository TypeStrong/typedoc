import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import type { ProjectReflection } from "../../../../models";
import type { PageEvent } from "../../../events";
import { JSX, Raw } from "../../../../utils";
import { displayPartsToMarkdown } from "../../lib";

export const indexTemplate = ({ markdown, urlTo }: DefaultThemeRenderContext, props: PageEvent<ProjectReflection>) => (
    <div class="tsd-panel tsd-typography">
        <Raw html={markdown(displayPartsToMarkdown(props.model.readme || [], urlTo))} />
    </div>
);
